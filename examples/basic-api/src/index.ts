// examples/basic-api/src/index.ts
import express from 'express'
import { createEmailService } from '../backend/email/src/index.js'

const app = express()
app.use(express.json())

// Update the config for Resend
const email = createEmailService({
  apiKey: 're_ainwUVJa_9wuES4rUriv7xK7rRQPrvbh4',
})

app.post('/welcome', async (req, res) => {
  const { email: toAddress } = req.body

  if (!toAddress) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    const result = await email.sendEmail({
      from: { address: 'onboarding@resend.dev' }, // Must use this on free tier
      to: [{ address: toAddress }], // Must be the email you signed up with
      subject: 'Welcome to the app (via Resend)!',
      text: 'This email was sent via HTTP. No SMTP port blocking here.',
    })

    res.json({ success: true, messageId: result.id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: String(error) })
  }
})

app.listen(3000, () => {
  console.log('Example app running on http://localhost:3000')
})
