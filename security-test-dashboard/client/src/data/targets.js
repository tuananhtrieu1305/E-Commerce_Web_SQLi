export const targets = {
  vulnerable: {
    label: "Backend vulnerable",
    baseUrl: "http://localhost:8081",
  },
  secure: {
    label: "Backend secure",
    baseUrl: "http://localhost:8082",
  },
  wafSecure: {
    label: "WAF secure route",
    baseUrl: "http://localhost/api/secure",
  },
};

