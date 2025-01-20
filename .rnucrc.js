const DETOX_BUILD = Boolean(process.env.RN_DETOX_BUILD);

function on_env(env) {
  return Object.assign({}, env, {
    DETOX_BUILD,
  });
}

module.exports = {
  on_env,
};
