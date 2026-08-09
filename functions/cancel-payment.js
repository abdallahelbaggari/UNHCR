/* UNHCR — /cancel-payment — Cloudflare Pages Function
   Cloudflare strips /functions/ prefix: this file serves at /cancel-payment */

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
  return new Response(
    JSON.stringify({ cancelled: true }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({ status: 'UNHCR cancel-payment endpoint live' }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}
