/* PortalFinance.com — business settings. Edit this file only; every page reads from it. */
window.PF_CONFIG = {
  siteName: "PortalFinance",
  domain: "https://portalfinance.com",
  adsenseClient: "ca-pub-6620975821265271",
  /* Optional manual ad units. Leave empty to rely on AdSense Auto ads (recommended until approved).
     Example: { inArticle: "1234567890", sidebar: "0987654321", calculator: "1122334455" } */
  adSlots: {},
  /* Contact routing. The address is stored encoded and only decoded in the browser at the moment
     a form is sent or the "Email us" link is clicked. It is never written into the page. */
  _k: [116,118,106,53,115,112,104,116,110,71,56,104,122,114,121,118,126,105,108,126],
  /* Optional: once FormSubmit sends its activation email, it can give you a random alias string.
     Paste it here to stop the decoded address from being used even in network requests. */
  formAlias: "",
  interestUrl: "https://web.works/contact",
  /* Donations: paste any payment link to make the support buttons go straight to checkout.
     While all are empty, supporters send a pledge and receive a secure payment link by reply. */
  donate: {
    paypal: "",       /* e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX */
    stripe: "",       /* e.g. https://buy.stripe.com/XXXX (a Payment Link with "customer chooses price") */
    buymeacoffee: "", /* e.g. https://buymeacoffee.com/yourname */
    goal: 10000,
    raised: 0,
    currency: "USD"
  },
  newsletterName: "The Portal Brief",
  social: { youtube: "", x: "", linkedin: "", instagram: "" }
};
