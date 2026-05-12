try {
  console.log('cwd:', process.cwd())
  console.log('resolve:', require.resolve('joi'))
} catch (e) {
  console.error('ERR', e && e.message)
  process.exit(1)
}
