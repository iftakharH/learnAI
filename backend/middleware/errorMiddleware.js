const FRIENDLY_ERRORS = [
  { re: /api.?key|invalid.*credentials|authenticat/i, msg: 'AI service authentication failed. Please check your GEMINI_API_KEY in the server .env file.' },
  { re: /quota|rate.?limit|429|resource.?exhausted/i, msg: 'AI service quota reached or rate limit hit. Please try again in a moment.' },
  { re: /timeout|timed.?out|network|ECONNREFUSED|fetch.?failed/i, msg: 'AI service timed out or is temporarily unavailable. Please try again.' },
  { re: /context.?length|token.?limit|content.?too.?long|too.?many.?tokens/i, msg: 'Document is too long to process fully; try a shorter file or split it into parts.' },
  { re: /malformed|unparseable|json.?parse|invalid.?json|response.?schema/i, msg: 'AI returned data we could not understand. Please retry the request.' },
  { re: /empty.*(response|ai|data)|readable text.*available|no readable/i, msg: 'Could not process this file. It may be a scanned-image PDF or an unsupported format.' },
  { re: /scanned|image pdf|no readable text/i, msg: 'Uploaded PDF appears to be a scanned image (no selectable text). Please upload a text-based PDF.' },
  { re: /gemini.?api.?key.*not.*config/i, msg: 'Server is missing GEMINI_API_KEY configuration. Ask your admin to configure it.' },
  { re: /model.?not.?found|gemini-36-flash/i, msg: 'AI model unavailable. The server configuration may need updating.' },
  { re: /permission|denied|forbidden|403/i, msg: 'Permission denied when contacting the AI service.' },
];

const makeFriendly = (message) => {
  if (!message) return 'Something went wrong. Please try again.';
  for (const { re, msg } of FRIENDLY_ERRORS) if (re.test(message)) return msg;
  return message;
};

// Express error middleware (4 args pattern)
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.statusCode || res.statusCode < 400 ? 500 : res.statusCode;
  const s = typeof status === 'number' && status >= 400 ? status : 500;
  const rawMessage = err.message || 'Internal Server Error';
  const friendly = makeFriendly(rawMessage);
  const userId = (req.user && req.user._id) ? req.user._id : 'anon';

  const line = `[ERROR ${s}] ${req.method || '?'} ${req.originalUrl || ''} user=${userId} | ${rawMessage}`;
  if (s >= 500) console.error(line, err.stack ? '\n' + err.stack : '');
  else console.warn(line);

  res.status(s).json({
    message: friendly,
    ...(process.env.NODE_ENV !== 'production' ? { rawMessage } : {}),
  });
};

module.exports = { errorHandler };
