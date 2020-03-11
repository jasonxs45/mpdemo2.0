import { getSafeArea } from '../base'
export const safeArea = ({ safeAreaInsetBottom = true, safeAreaInsetTop = false } = {}) => Behavior({
  properties: {
    safeAreaInsetTop: {
      type: Boolean,
      value: safeAreaInsetTop
    },
    safeAreaInsetBottom: {
      type: Boolean,
      value: safeAreaInsetBottom
    }
  },
  created() {
    getSafeArea().then(({ isIphoneX, statusBarHeight }) => {
      this.set({
        isIphoneX,
        statusBarHeight
      })
    })
  }
})