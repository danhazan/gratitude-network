#!/usr/bin/env node

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var http = require('http');
var https = require('https');

function DevServerHealthCheck() {
  this.devProcess = null;
  this.isCleaningUp = false;
}

DevServerHealthCheck.prototype.run = function() {
  var self = this;
  
  console.log('🚀 Starting dev server health check...');
  
  return this.startDevServer()
    .then(function() {
      return self.waitForServer();
    })
    .then(function() {
      return self.testLandingPage();
    })
    .then(function(result) {
      console.log('✅ Health check completed: ' + result.status + ' - ' + result.message);
      return result;
    })
    .catch(function(error) {
      console.error('❌ Health check failed: ' + error.message);
      return { status: 'ERROR', message: error.message };
    })
    .finally(function() {
      return self.cleanup();
    });
};

DevServerHealthCheck.prototype.startDevServer = function() {
  var self = this;
  
  return new Promise(function(resolve, reject) {
    console.log('📦 Starting npm run dev...');
    
    self.devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      detached: !process.platform.startsWith('win')
    });

    var hasStarted = false;
    var startupTimeout;

    self.devProcess.stdout.on('data', function(data) {
      var output = data.toString();
      console.log('[DEV] ' + output.trim());
      
      if (!hasStarted && (
        output.includes('Local:') || 
        output.includes('localhost') ||
        output.includes('ready') ||
        output.includes('compiled') ||
        output.includes('started')
      )) {
        hasStarted = true;
        clearTimeout(startupTimeout);
        resolve();
      }
    });

    self.devProcess.stderr.on('data', function(data) {
      var error = data.toString();
      console.error('[DEV ERROR] ' + error.trim());
      
      if (error.toLowerCase().includes('error') && !error.toLowerCase().includes('warning')) {
        if (!hasStarted) {
          clearTimeout(startupTimeout);
          reject(new Error('Dev server failed to start: ' + error));
        }
      }
    });

    self.devProcess.on('close', function(code) {
      if (!hasStarted && code !== 0) {
        clearTimeout(startupTimeout);
        reject(new Error('Dev server exited with code ' + code));
      }
    });

    self.devProcess.on('error', function(error) {
      if (!hasStarted) {
        clearTimeout(startupTimeout);
        reject(new Error('Failed to start dev server: ' + error.message));
      }
    });

    startupTimeout = setTimeout(function() {
      if (!hasStarted) {
        reject(new Error('Dev server startup timeout (30s)'));
      }
    }, 30000);
  });
};

DevServerHealthCheck.prototype.waitForServer = function(maxAttempts, delay) {
  var self = this;
  maxAttempts = maxAttempts || 20;
  delay = delay || 1000;
  
  console.log('⏳ Waiting for server to be ready...');
  
  function attemptConnection(attempt) {
    return self.makeRequest('http://localhost:3000')
      .then(function() {
        console.log('✅ Server is ready!');
        return Promise.resolve();
      })
      .catch(function(error) {
        if (attempt >= maxAttempts) {
          throw new Error('Server not ready after ' + maxAttempts + ' attempts');
        }
        console.log('⏳ Attempt ' + attempt + '/' + maxAttempts + ' - waiting...');
        return self.sleep(delay).then(function() {
          return attemptConnection(attempt + 1);
        });
      });
  }
  
  return attemptConnection(1);
};

DevServerHealthCheck.prototype.testLandingPage = function() {
  var self = this;
  console.log('🔍 Testing landing page...');
  
  var testUrls = [
    'http://localhost:3000',
    'http://localhost:3000/',
    'http://localhost:5173',
    'http://localhost:5173/',
    'http://localhost:8080',
    'http://localhost:8080/'
  ];

  function tryUrl(index) {
    if (index >= testUrls.length) {
      throw new Error('Landing page not accessible on any common ports');
    }
    
    var url = testUrls[index];
    return self.makeRequest(url)
      .then(function(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return {
            status: '200 OK',
            message: 'Landing page accessible at ' + url,
            url: url,
            statusCode: response.statusCode
          };
        }
        return tryUrl(index + 1);
      })
      .catch(function(error) {
        return tryUrl(index + 1);
      });
  }
  
  return tryUrl(0);
};

DevServerHealthCheck.prototype.makeRequest = function(url) {
  return new Promise(function(resolve, reject) {
    var urlObj = new URL(url);
    var client = urlObj.protocol === 'https:' ? https : http;
    
    var options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 5000
    };

    var req = client.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', function(error) {
      reject(error);
    });

    req.on('timeout', function() {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

DevServerHealthCheck.prototype.cleanup = function() {
  var self = this;
  
  if (this.isCleaningUp) return Promise.resolve();
  this.isCleaningUp = true;
  
  console.log('🧹 Cleaning up processes...');
  
  if (this.devProcess) {
    var pid = this.devProcess.pid;
    console.log('📋 Killing process tree for PID: ' + pid);
    
    return this.killProcessTree(pid)
      .then(function() {
        return self.sleep(1000);
      })
      .then(function() {
        return self.killProcessesOnPorts([3000, 5173, 8080]);
      })
      .then(function() {
        console.log('✅ Cleanup completed');
      })
      .catch(function(error) {
        console.error('⚠️ Cleanup warning: ' + error.message);
      });
  }
  
  return Promise.resolve();
};

DevServerHealthCheck.prototype.killProcessTree = function(pid) {
  var isWindows = process.platform === 'win32';
  
  return new Promise(function(resolve) {
    if (isWindows) {
      exec('taskkill /F /T /PID ' + pid, function(error, stdout, stderr) {
        if (error) {
          console.log('Process ' + pid + ' may have already terminated');
        } else {
          console.log('✅ Killed process tree for PID ' + pid);
        }
        resolve();
      });
    } else {
      try {
        process.kill(-pid, 'SIGTERM');
        
        setTimeout(function() {
          try {
            process.kill(-pid, 'SIGKILL');
            console.log('✅ Killed process group for PID ' + pid);
          } catch (e) {
            // Process already terminated
          }
          resolve();
        }, 1000);
      } catch (error) {
        try {
          process.kill(pid, 'SIGTERM');
          setTimeout(function() {
            try {
              process.kill(pid, 'SIGKILL');
            } catch (e) {
              // Process already terminated
            }
            resolve();
          }, 1000);
        } catch (e) {
          console.log('Process ' + pid + ' may have already terminated');
          resolve();
        }
      }
    }
  });
};

DevServerHealthCheck.prototype.killProcessesOnPorts = function(ports) {
  var self = this;
  
  function killPort(index) {
    if (index >= ports.length) {
      return Promise.resolve();
    }
    
    var port = ports[index];
    console.log('🔍 Checking for processes on port ' + port + '...');
    
    var isWindows = process.platform === 'win32';
    
    return new Promise(function(resolve) {
      if (isWindows) {
        exec('netstat -ano | findstr :' + port, function(error, stdout) {
          if (stdout) {
            console.log('🎯 Found processes on port ' + port + ', killing them...');
            var lines = stdout.split('\n');
            var pids = [];
            
            for (var i = 0; i < lines.length; i++) {
              var line = lines[i];
              var parts = line.trim().split(/\s+/);
              var pid = parts[parts.length - 1];
              if (pid && pid !== '0' && !isNaN(pid)) {
                pids.push(pid);
              }
            }
            
            var killPromises = pids.map(function(pid) {
              return new Promise(function(killResolve) {
                exec('taskkill /F /PID ' + pid, function(killError) {
                  if (!killError) {
                    console.log('✅ Killed PID ' + pid + ' on port ' + port);
                  }
                  killResolve();
                });
              });
            });
            
            Promise.all(killPromises).then(resolve);
          } else {
            resolve();
          }
        });
      } else {
        exec('lsof -ti tcp:' + port, function(error, stdout) {
          if (stdout) {
            console.log('🎯 Found processes on port ' + port + ', killing them...');
            var pids = stdout.trim().split('\n').filter(function(pid) {
              return pid;
            });
            
            var killPromises = pids.map(function(pid) {
              return new Promise(function(killResolve) {
                exec('kill -9 ' + pid, function(killError) {
                  if (!killError) {
                    console.log('✅ Killed PID ' + pid + ' on port ' + port);
                  }
                  killResolve();
                });
              });
            });
            
            Promise.all(killPromises).then(resolve);
          } else {
            resolve();
          }
        });
      }
    }).then(function() {
      return killPort(index + 1);
    }).catch(function(error) {
      console.log('⚠️ Could not clean port ' + port + ': ' + error.message);
      return killPort(index + 1);
    });
  }
  
  return killPort(0);
};

DevServerHealthCheck.prototype.sleep = function(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
};

// Handle process signals for cleanup
var healthCheck = new DevServerHealthCheck();

process.on('SIGINT', function() {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  healthCheck.cleanup().then(function() {
    process.exit(0);
  });
});

process.on('SIGTERM', function() {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  healthCheck.cleanup().then(function() {
    process.exit(0);
  });
});

process.on('uncaughtException', function(error) {
  console.error('💥 Uncaught Exception:', error);
  healthCheck.cleanup().then(function() {
    process.exit(1);
  });
});

// Run the health check
if (require.main === module) {
  healthCheck.run().then(function(result) {
    process.exit(result.status === '200 OK' ? 0 : 1);
  }).catch(function(error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = DevServerHealthCheck;
