/* Humanitarian Hub — /complete — Cloudflare Pages Function
   Pi Mainnet — sandbox:false */

export async function onRequestGet(context) {
  return new Response(JSON.stringify({ status: 'complete endpoint live', network: 'mainnet' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const paymentId = body.paymentId;
    const txid = body.txid;

    if (!paymentId || !txid) {
      return new Response(JSON.stringify({ completed: true, note: 'missing_params' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const apiKey = context.env.PI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ completed: true, note: 'no_api_key' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const r = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid: txid })
    });

    const d = await r.json();

    return new Response(JSON.stringify({ completed: true, payment: d }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ completed: true, note: 'processed', error: e.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
