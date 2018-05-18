<template lang="pug">
  div.side-main-nav.side-nav.d-flex.flex-column.align-items-center
    a.nav-item.d-flex.justify-content-center.align-items-center(href="/",:class="isActiveClass('home')")
      i.fa.fa-2x.fa-home
    a.nav-item.d-flex.justify-content-center.align-items-center(href="/dashboard",:class="isActiveClass('dashboard')")
      i.fa.fa-2x.fa-list-ul
    a.nav-item.d-flex.justify-content-center.align-items-center(href="/topten",:class="isActiveClass('topten')")
      i.fa.fa-2x.fa-users
</template>

<script>
  export default {
    methods: {
      isActiveClass(which) {
        const path = this.$route.path
        if (path) {
          switch(which) {
            case 'home':
              return (path == '/') ? 'active' : null
            case 'dashboard':
              return (/^\/dashboard.*$/.test(path)) ? 'active': null
            case 'topten':
              return (/^\/topten.*$/.test(path)) ? 'active': null
          }
        }

        return (which == 'home') ? 'active' : null
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../css/main.scss";

  .side-main-nav {
    background: $dark_color;
    color: #fff;
    float: left;
    width: 80px;

    .nav-item {
      height: 80px;
      width: 100%;
    }

    .nav-item {
      color: inherit;

      &.active {
        background: rgba(255, 255, 255, 0.1);
      }

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        text-decoration: inherit;
      }
    }
  }
</style>
