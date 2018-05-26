import assert from 'assert'
import { createNestedArrays, flatten, paginateArray } from './Helpers'

describe('Helpers', () => {
  describe('#createNestedArrays', () => {
    it(`should return an array of arrays of specified length`, function() {
      const ary = new Array(100).fill(0).map((_, i) => i+1)
      const nested5 = createNestedArrays(ary, 5)
      const nested10 = createNestedArrays(ary, 10)
      const nested25 = createNestedArrays(ary, 25)

      assert.equal(20, nested5.length)
      assert.equal(5, nested5[0].length)
      assert.equal(5, nested5[19].length)
      assert.equal('undefined', typeof nested5[20])
      assert.equal(1, nested5[0][0])
      assert.equal(2, nested5[0][1])
      assert.equal(3, nested5[0][2])
      assert.equal(4, nested5[0][3])
      assert.equal(5, nested5[0][4])
      assert.equal('undefined', typeof nested5[0][5])

      assert.equal(10, nested10.length)
      assert.equal(4, nested25.length)
    })
  })

  describe('#flatten', () => {
    it(`should flatten array with nested arrays`, function() {
      const nestedArray1 = [1, 2, [3, [4, 5]], [6, [7, 8, 9, [10]]]]
      const desiredArray1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      const flattenedArray1 = flatten(nestedArray1)
      flattenedArray1.forEach((v, i) => {
        assert.equal(desiredArray1[i], v)
      })
    })
  })

  describe(`#paginateArray()`, () => {
    const ary = [1,2,3,4,5,6,7,8,9,10,11,12]
    const perPage = 5
    const obj1 = paginateArray(ary, perPage, 1)
    const obj2 = paginateArray(ary, perPage, 2)
    const obj3 = paginateArray(ary, perPage, 3)
    const obj4 = paginateArray(ary, 1e4, 1)

    it(`should return valid information for first page`, function() {
      assert.equal(5, obj1.data.length)
      assert.equal(3, obj1.number_of_pages)
      assert.equal(1, obj1.current_page)
      assert.equal(12, obj1.data_length)
    })

    it(`should return valid information for second page`, function() {
      assert.equal(5, obj2.data.length)
      assert.equal(3, obj2.number_of_pages)
      assert.equal(2, obj2.current_page)
      assert.equal(12, obj2.data_length)
    })

    it(`should return valid information for third page`, function() {
      assert.equal(2, obj3.data.length)
      assert.equal(3, obj3.number_of_pages)
      assert.equal(3, obj3.current_page)
      assert.equal(12, obj3.data_length)
    })

    it(`should return all information for more perPage than entries`, function() {
      assert.equal(12, obj4.data.length)
      assert.equal(1, obj4.number_of_pages)
      assert.equal(1, obj4.current_page)
      assert.equal(12, obj4.data_length)
    })
  })
})
