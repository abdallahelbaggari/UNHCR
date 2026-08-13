/* Humanitarian Hub — /cancel-payment — Cloudflare Pages Function
   Pi Mainnet — sandbox:false */

export async function onRequestGet(context) {
  return new Response(JSON.stringify({ status: 'cancel-payment endpoint live' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
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

    if (!paymentId) {
      return new Response(JSON.stringify({ cancelled: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    /* Pi Mainnet cancel — no Pi API call needed, just acknowledge */
    return new Response(JSON.stringify({ cancelled: true, paymentId: paymentId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ cancelled: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
