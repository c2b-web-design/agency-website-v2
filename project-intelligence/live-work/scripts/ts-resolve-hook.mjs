/**
 * A Node resolve hook: a relative import with no extension retries with ".ts". The `components/about/` modules
 * import their siblings the Next way (`./about-room`); plain Node does not resolve those. Registered by scripts
 * that import such a module: `register("./ts-resolve-hook.mjs", import.meta.url)`.
 */
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context);
    throw err;
  }
}
