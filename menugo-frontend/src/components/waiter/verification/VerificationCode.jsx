import {useState} from 'react'
import Input from '../../common/Input'
import Button from '../../common/Button'

const VerificationCode = ({ onVerify, isLoading }) => {
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.length === 6) {
      onVerify(code)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Enter 6-digit verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="XXXXXX"
        maxLength={6}
        required
      />
      <Button type="submit" isLoading={isLoading} fullWidth>
        Verify Order
      </Button>
    </form>
  )
}

export default VerificationCode