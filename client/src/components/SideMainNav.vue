<template lang="pug">
  div.side-main-nav.side-nav.d-flex.flex-column.align-items-center
    a.nav-item.d-flex.justify-content-center.align-items-center(href="/")
      i.fa.fa-2x.fa-home
    a.nav-item.d-flex.justify-content-center.align-items-center(href="/dashboard")
      i.fa.fa-2x.fa-list-ul
    a.nav-item.d-flex.justify-content-center.align-items-center(href="/topten")
      i.fa.fa-2x.fa-users
</template>

<style lang="scss" scoped>
  .side-main-nav {
    background: #343a40;
    color: #fff;
    float: left;
    width: 80px;

    .nav-item {
      height: 80px;
      width: 100%;
    }

    .nav-item {
      color: inherit;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
</style>
