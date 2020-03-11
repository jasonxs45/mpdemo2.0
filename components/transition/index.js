import MComponent from '../../common/MComponent'
import { isObj } from '../../utils/util'
const getClassNames = name => ({
  enter: `${name}-enter ${name}-enter-active enter-class enter-active-class`,
  'enter-to': `${name}-enter-to ${name}-enter-active enter-to-class enter-active-class`,
  leave: `${name}-leave ${name}-leave-active leave-class leave-active-class`,
  'leave-to': `${name}-leave-to ${name}-leave-active leave-to-class leave-active-class`
})
const nextTick = () => new Promise(resolve => setTimeout(resolve, 1000 / 20))
MComponent({
  externalClasses: [
    'enter-class',
    'enter-active-class',
    'enter-to-class',
    'leave-class',
    'leave-active-class',
    'leave-to-class'
  ],
  properties: {
    customStyle: String,
    show: {
      type: Boolean,
      value: true,
      observer: 'observeShow'
    },
    duration: {
      type: [Number, Object],
      value: 300,
      observer: 'observeDuration'
    },
    name: {
      type: String,
      value: 'fade',
      observer: 'updateClasses'
    }
  },
  data: {
    type: '',
    inited: false,
    display: false,
    classNames: getClassNames('fade')
  },
  methods: {
    observeShow(value) {
      if (value) {
        this.enter()
      }
      else {
        this.leave()
      }
    },
    updateClasses(name) {
      this.set({
        classNames: getClassNames(name)
      })
    },
    enter () {
      const { classNames, duration } = this.data;
      const currentDuration = isObj(duration) ? duration.leave : duration
      this.status = 'enter'
      Promise.resolve()
        .then(nextTick)
        .then(() => {
          this.checkStatus('enter')
          this.set({
            inited: true,
            display: true,
            classes: classNames.enter,
            currentDuration
          })
        })
        .then(nextTick)
        .then(() => {
          this.checkStatus('enter');
          this.set({
            classes: classNames['enter-to']
          })
        })
        .catch(() => { })
    },
    leave() {
      const { classNames, duration } = this.data;
      const currentDuration = isObj(duration) ? duration.leave : duration;
      this.status = 'leave';
      Promise.resolve()
        .then(nextTick)
        .then(() => {
          this.checkStatus('leave')
          this.set({
            classes: classNames.leave,
            currentDuration
          });
        })
        .then(() => setTimeout(() => this.onTransitionEnd(), currentDuration))
        .then(nextTick)
        .then(() => {
          this.checkStatus('leave');
          this.set({
            classes: classNames['leave-to']
          });
        })
        .catch(() => { })
    },
    checkStatus(status) {
      if (status !== this.status) {
        throw new Error(`incongruent status: ${status}`)
      }
    },
    onTransitionEnd() {
      if (!this.data.show) {
        this.set({ display: false })
        this.triggerEvent('transitionEnd')
      }
    }
  },
  attached () {
    if (this.data.show) {
      this.enter()
    }
  }
})
