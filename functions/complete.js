/* UNHCR — /complete — Cloudflare Pages Function
   Cloudflare strips /functions/ prefix: this file serves at /complete */

export async function onRequestGet(context) {
  return new Response(JSON.stringify({ status: 'UNHCR complete endpoint live' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestPost(context) {
  try {
    var body = await context.request.json();
    var paymentId = body.paymentId;
    var txid = body.txid;
    if (!paymentId || !txid) return new Response(
      JSON.stringify({ completed: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
    var r = await fetch('https://api.minepi.com/v2/payments/' + paymentId + '/complete', {
      method: 'POST',
      headers: {
        'Authorization': 'Key ' + context.env.PI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid: txid })
    });
    var d = await r.json();
    return new Response(
      JSON.stringify({ completed: true, payment: d }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ completed: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
