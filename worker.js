export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/designer') && !url.pathname.match(/\.[^/]+$/)) {
      const rewritten = new Request(new URL('/designer/designer.html', url.origin), request);
      return env.ASSETS.fetch(rewritten);
    }

    // SPA fallback for main game
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url.origin), request));
    }

    return response;
  }
}