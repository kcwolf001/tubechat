const { Innertube } = require('youtubei.js');
(async () => {
  const yt = await Innertube.create();
  const info = await yt.getInfo('UF8uR6Z6KLc');
  const transcript = await info.getTranscript();
  const body = transcript?.transcript?.content?.body;
  console.log('Has segments:', !!body?.initial_segments);
  if (body?.initial_segments) {
    console.log('Count:', body.initial_segments.length);
    const first = body.initial_segments[0];
    console.log('First segment:', JSON.stringify(first, null, 2));
  }
})().catch(e => console.log('Error:', e.message));
