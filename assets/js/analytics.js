/*
 * Analytics (PostHog)
 *
 * Declarative click tracking: add data-ph-event="event_name" to any element.
 * Extra data-ph-* attributes become event properties, e.g.
 *   <a href="..." data-ph-event="resume_opened" data-ph-location="hero">
 *   -> capture('resume_opened', { location: 'hero', href: '...' })
 *
 * Custom events from other scripts: window.track('event_name', { ... })
 *
 * On localhost (any port) or file://, PostHog is not loaded and events are
 * only logged to the console as "[analytics] ...".
 */

var IS_LOCAL = ['localhost', '127.0.0.1', '[::1]', '0.0.0.0', ''].indexOf(location.hostname) !== -1;

if (!IS_LOCAL) {
// PostHog loader snippet (from PostHog project settings)
!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}p||((p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r));var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="th ih nh sh ah init qh jh Ah Oh Uh Gu Nh Wh Eh Kh Xh Yh td ed nd capture getExtension Bh dr Dh Lh calculateEventProperties rd register register_once register_for_session unregister unregister_for_session hd Rh ad getFeatureFlag getFeatureFlagPayload getFeatureFlagResult getAllFeatureFlags isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys onActiveMatchingSurveysChanged renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync dd identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset vd shutdown setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty ld Qh createPersonProfile setInternalOrTestUser ud fh hh opt_in_capturing opt_out_capturing dh has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Vh debug Qu Os getPageViewId captureTraceFeedback captureTraceMetric Ch".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_nqVXbB5u65ejNSeZMqZggQKibowsMpELnX5LpHDNBu9A', {
  api_host: 'https://us.i.posthog.com',
  defaults: '2026-05-30',
  person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
});
}

(function () {
  // Logs locally; no-op if PostHog failed to load (e.g. blocked)
  function track(event, props) {
    if (IS_LOCAL) { console.log('[analytics]', event, props); return; }
    try { if (window.posthog) window.posthog.capture(event, props); } catch (e) {}
  }
  window.track = track;

  // Clicks: any element with data-ph-event
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-ph-event]');
    if (!el) return;
    var props = {};
    Object.keys(el.dataset).forEach(function (key) {
      if (key.indexOf('ph') !== 0 || key === 'phEvent') return;
      props[key.charAt(2).toLowerCase() + key.slice(3)] = el.dataset[key];
    });
    if (el.href) props.href = el.getAttribute('href');
    track(el.dataset.phEvent, props);
  });

  // Theme toggle: the page's own handler runs first, so data-theme is already updated
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      track('theme_toggled', { theme: document.documentElement.getAttribute('data-theme') });
    });
  }

  // Scroll depth: each milestone fires once per page load
  var depths = [25, 50, 75, 100];
  function onScroll() {
    var h = document.documentElement;
    var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    while (depths.length && scrolled >= depths[0] - 0.5) {
      track('scroll_depth', { percent: depths.shift() });
    }
    if (!depths.length) window.removeEventListener('scroll', onScroll);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Sections: viewed once its top passes 60% of the viewport
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          track('section_viewed', { section: e.target.id });
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -40% 0px', threshold: 0 });
    document.querySelectorAll('section[id]').forEach(function (el) { io.observe(el); });
  }
})();
