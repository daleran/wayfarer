export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // For /designer paths with no file extension, serve designer's index
    if (url.pathname.startsWith('/designer') && !url.pathname.match(/\.[^/]+$/)) {
      const rewritten = new Request(new URL('/designer/index.html', url.origin), request);
      return env.ASSETS.fetch(rewritten);
    }

    return env.ASSETS.fetch(request);
  }
}