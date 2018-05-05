<template>
  <div class="Typeahead">
    <!-- optional indicators -->
    <i class="fa fa-spinner fa-spin" v-if="loading"></i>
    <template v-else>
      <i class="fa fa-search" v-show="isEmpty"></i>
      <i class="fa fa-times" v-show="isDirty" @click="reset"></i>
    </template>

    <!-- the input field -->
    <input type="text"
           class="form-control"
           :placeholder="'Enter ' + minChars + ' character(s) to search...'"
           autocomplete="off"
           v-model="query"
           @keydown.down="down"
           @keydown.up="up"
           @keydown.enter="hit"
           @keydown.esc="reset"
           @blur="reset"
           @input="update"/>

    <!-- the list -->
    <ul v-show="hasItems">
      <li v-for="(item, $item) in items" :class="activeClass($item)" @mousedown="hit" @mousemove="setActive($item)">
        <span v-text="getDropdownText(item)"></span>
      </li>
    </ul>
  </div>
</template>

<script>
import VueTypeahead from 'vue-typeahead'

export default {
  extends: VueTypeahead,

  props: {
    // expects:
    //    `src` (required): backend route to return data,
    //    `showProp` (optional): property in each item to show in the output,
    //    `showPropFunction` (optional): function to return a string to show - NOTE: this takes precedence over `showProp`,
    //    `keysFromResponse` (optional): key(s) to get array of data, ex. 'ary', 'object.ary', 'object1.object2.ary'
    params: { type: Object }
  },

  data () {
    return {
      // The source url
      // (required)
      src: this.params.src,

      // Limit the number of items which is shown at the list
      // (optional)
      limit: this.params.limit || 10,

      // The minimum character length needed before triggering
      // (optional)
      minChars: this.params.minChars || 3,

      // Highlight the first item in the list
      // (optional)
      selectFirst: false,

      // Override the default value (`q`) of query parameter name
      // Use a falsy value for RESTful query
      // (optional)
      queryParamName: 'search'
    }
  },

  methods: {
    getDropdownText(item) {
      const showPropFunction  = this.params.showPropFunction
      const showProp          = this.params.showProp || 'name'

      return (typeof showPropFunction === 'function')
        ? showPropFunction(item)
        : ((showProp && item[showProp]) ? item[showProp] : item)
    },

    // The callback function which is triggered when the user hits on an item
    // (required)
    onHit(item) {
      this.$emit('onHit', item)
    },

    // The callback function which is triggered when the response data are received
    // (optional)
    // Supports the following syntax:
    // key
    // key1.key2
    prepareResponseData(data) {
      const keysFromResponse = this.params.keysFromResponse
      if (typeof keysFromResponse === 'string' && keysFromResponse) {
        const keys = keysFromResponse.split('.')
        return keys.reduce((o, v) => o[v], data)
      }
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../css/main.scss";

  .Typeahead {
    position: relative;

    .Typeahead__input {
      width: 100%;
      font-size: 14px;
      color: #2c3e50;
      line-height: 1.42857143;
      box-shadow: inset 0 1px 4px rgba(0,0,0,.4);
      -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
      transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
      font-weight: 300;
      padding: 12px 26px;
      border: none;
      border-radius: 22px;
      letter-spacing: 1px;
      box-sizing: border-box;
    }

    .Typeahead__input:focus {
      border-color: #4fc08d;
      outline: 0;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.075),0 0 8px #4fc08d;
    }

    .fa-times {
      color: red;
      cursor: pointer;
    }

    i {
      float: right;
      position: relative;
      top: 26px;
      right: 15px;
      opacity: 0.4;
    }

    ul {
      position: absolute;
      padding: 0;
      margin-top: 8px;
      min-width: 100%;
      background-color: #fff;
      list-style: none;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0,0,0, 0.25);
      z-index: 1000;
    }

    li {
      padding: 10px 16px;
      border-bottom: 1px solid #ccc;
      cursor: pointer;
    }

    li:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    li:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border-bottom: 0;
    }

    span {
      display: block;
      color: #2c3e50;
    }

    .active {
      background-color: $body_color;
    }

    .active span {
      color: white;
    }

    .name {
      font-weight: 700;
      font-size: 18px;
    }

    .screen-name {
      font-style: italic;
    }
  }
</style>
