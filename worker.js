export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/designer' || url.pathname === '/designer/') {
      return env.ASSETS.fetch('/designer/designer.html');
    }

    if (url.pathname.startsWith('/designer/')) {
      return env.ASSETS.fetch(request);
    }

    // SPA fallback for main game
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch('/index.html');
    }

    return response;
  }
}