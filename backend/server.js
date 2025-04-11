import express from 'express'
import rateLimit from 'express-rate-limit'
import { createLogger, transports, format } from 'winston'
import { v4 as uuidv4 } from 'uuid'

// Configure CSP report logger
const cspLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'csp-reports.log' })
  ]
})

// Rate limiter for CSP reports (10 requests/minute per IP)
const cspRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many CSP reports from this IP, please try again later',
  skipSuccessfulRequests: true
})

/**
 * CSP Report Endpoint
 * @route POST /csp-report
 * @desc Handle Content Security Policy violation reports
 * @access Public
 * @headers Content-Type: application/csp-report
 * @returns HTTP 204 on success
 */
app.post('/csp-report', cspRateLimiter, (req, res) => {
  // Validate Content-Type
  if (!req.is('application/csp-report')) {
    return res.status(415).send('Unsupported Media Type')
  }

  try {
    const reportId = uuidv4()
    const { 'csp-report': report } = req.body

    // Log violation with essential details
    cspLogger.info({
      id: reportId,
      timestamp: new Date().toISOString(),
      violatedDirective: report['violated-directive'],
      documentUri: report['document-uri'],
      referrer: report.referrer,
      blockedUri: report['blocked-uri'],
      userAgent: req.headers['user-agent'],
      sourceIp: req.ip
    })

    return res.status(204).send()
  } catch (error) {
    cspLogger.error({
      message: 'Error processing CSP report',
      error: error.message,
      stack: error.stack
    })
    return res.status(400).send('Bad Request')
  }
})