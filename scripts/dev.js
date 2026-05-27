const { spawn } = require('child_process')

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const backendDir = `${process.cwd()}\\menugo-backends`
const frontendDir = `${process.cwd()}\\menugo-frontend`
const backendHealthUrl = 'http://127.0.0.1:5003/health'

const backend = spawn(npmCommand, ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
})

const frontend = { process: null }

const startFrontend = () => {
  if (frontend.process) return

  frontend.process = spawn(npmCommand, ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
  })

  frontend.process.on('exit', (code) => {
    if (backend.exitCode === null) {
      backend.kill()
    }
    process.exitCode = code ?? 0
  })
}

const waitForBackend = async (timeoutMs = 30000) => {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(backendHealthUrl)
      if (response.ok) return true
    } catch (error) {
      // backend not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return false
}

backend.on('exit', (code) => {
  if (frontend.process) {
    frontend.process.kill()
  }
  process.exitCode = code ?? 0
})

waitForBackend().then((ready) => {
  if (!ready) {
    console.warn('Backend health check timed out; starting frontend anyway.')
  }
  startFrontend()
})

const shutdown = () => {
  if (frontend.process) frontend.process.kill()
  if (backend.exitCode === null) backend.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)