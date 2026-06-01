const { spawn } = require('child_process')
const path = require('path')

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const backendDir = path.resolve(process.cwd(), 'menugo-backends')
const frontendDir = path.resolve(process.cwd(), 'menugo-frontend')
const defaultBackendPort = 5003
const backendHealthUrl = (port) => `http://127.0.0.1:${port}/health`

const spawnOptions = (cwd) => ({
  cwd,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

const backend = spawn(npmCommand, ['run', 'dev'], spawnOptions(backendDir))

const frontend = { process: null }
let detectedBackendPort = null
let frontendStarted = false

const startFrontend = (port = defaultBackendPort) => {
  if (frontend.process || frontendStarted) return

  frontendStarted = true
  const frontendEnv = {
    ...process.env,
    VITE_API_URL: `http://localhost:${port}/api`,
  }

  frontend.process = spawn(npmCommand, ['run', 'dev'], {
    ...spawnOptions(frontendDir),
    env: frontendEnv,
  })

  frontend.process.on('exit', (code) => {
    if (backend.exitCode === null) {
      backend.kill()
    }
    process.exitCode = code ?? 0
  })
}

const detectPortFromOutput = (chunk) => {
  const text = String(chunk || '')
  const match = text.match(/Server running on port (\d+)/)
  if (match) {
    detectedBackendPort = Number(match[1])
    if (!Number.isNaN(detectedBackendPort)) {
      startFrontend(detectedBackendPort)
    }
  }
}

backend.stdout?.on('data', detectPortFromOutput)
backend.stderr?.on('data', detectPortFromOutput)

const waitForBackend = async (timeoutMs = 30000) => {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(backendHealthUrl(detectedBackendPort || defaultBackendPort))
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
  if (!ready && !frontendStarted) {
    console.warn('Backend health check timed out; starting frontend anyway.')
    startFrontend(detectedBackendPort || defaultBackendPort)
  }
})

const shutdown = () => {
  if (frontend.process) frontend.process.kill()
  if (backend.exitCode === null) backend.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)