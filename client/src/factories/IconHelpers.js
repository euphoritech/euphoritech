export function commonClasses() {
  return {
    github: 'devicon-github-plain',
    google: 'devicon-google-plain',
    manual: [ 'fa', 'fa-users' ],
    salesforce: [ 'fa', 'fa-cloud' ]
  }
}

export function vendorClass(vendor) {
  return commonClasses()[vendor]
}
