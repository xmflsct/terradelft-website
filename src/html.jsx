import React from "react";
import PropTypes from "prop-types";

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(d) {
                var config = {
                    kitId: "rdn6rzv",
                    scriptTimeout: 3000,
                    async: true
                  },
                  h = d.documentElement,
                  t = setTimeout(function() {
                    h.className = h.className.replace(/\bwf-loading\b/g, "") + " wf-inactive";
                  }, config.scriptTimeout),
                  tk = d.createElement("script"),
                  f = false,
                  s = d.getElementsByTagName("script")[0],
                  a;
                h.className += " wf-loading";
                tk.src = "https://use.typekit.net/" + config.kitId + ".js";
                tk.async = true;
                tk.onload = tk.onreadystatechange = function() {
                  a = this.readyState;
                  if (f || (a && a != "complete" && a != "loaded")) return;
                  f = true;
                  clearTimeout(t);
                  try {
                    Typekit.load(config);
                  } catch (e) {}
                };
                s.parentNode.insertBefore(tk, s);
              })(document);
            `
          }}
        />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <noscript key="noscript" id="gatsby-noscript">
          This app works best with JavaScript enabled.
        </noscript>
        <div
          key="body"
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  );
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array
};
