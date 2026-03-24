export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/designer' || url.pathname === '/designer/') {
      return env.ASSETS.fetch(new Request(new URL('/designer/designer.html', url.origin), request));
    }

    // Other /designer/* paths (assets etc) pass through normally
    if (url.pathname.startsWith('/designer/')) {
      return env.ASSETS.fetch(request);
    }

    // SPA fallback for main game
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url.origin), request));
    }

    return response;
  }
}