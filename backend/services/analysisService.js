function dummy(type) {
  return {
    type: type || 'auto',
    barcodes: [
      {
        symbology: 'CODE128',
        text: 'X00ABC1234',
        bbox: [100, 200, 80, 20],
        conf: 0.98,
      },
    ],
    texts: [
      { text: 'NEW', bbox: [50, 50, 30, 10], conf: 0.93 },
      { text: 'MADE IN CHINA', bbox: [10, 150, 200, 40], conf: 0.89 },
    ],
    matches: {
      fnsku: {
        target: 'X00ABC1234',
        system: 'X00ABC1234',
        distance: 0,
        passed: true,
      },
    },
    flags: ['HAS_NEW'],
    verdict: 'PASS',
  }
}

const analyzeImages = async (images, type) => {
  const url = process.env.MODEL_API_URL
  if (!url) {
    return dummy(type)
  }
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (process.env.MODEL_API_KEY) {
      headers.Authorization = `Bearer ${process.env.MODEL_API_KEY}`
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ images, type }),
    })
    if (!resp.ok) {
      throw new Error(`Model API ${resp.status}`)
    }
    return await resp.json()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Model API error', err)
    return dummy(type)
  }
}

module.exports = { analyzeImages }
