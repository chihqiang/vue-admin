/**
 * Button 组件单元测试
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/form/Button.vue'

describe('Button', () => {
  it('渲染默认按钮', () => {
    const wrapper = mount(Button, {
      slots: { default: '确定' },
    })
    expect(wrapper.text()).toBe('确定')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('primary 类型有蓝色背景类', () => {
    const wrapper = mount(Button, {
      props: { type: 'primary' },
      slots: { default: '提交' },
    })
    expect(wrapper.classes()).toContain('bg-blue-500')
  })

  it('danger 样式有红色背景', () => {
    const wrapper = mount(Button, {
      props: { type: 'primary', danger: true },
      slots: { default: '删除' },
    })
    expect(wrapper.classes()).toContain('bg-red-500')
  })

  it('disabled 属性禁止点击', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: '禁用' },
    })
    expect(wrapper.classes()).toContain('cursor-not-allowed')
    expect(wrapper.classes()).toContain('opacity-60')
  })

  it('点击时触发 click 事件', async () => {
    const wrapper = mount(Button, {
      slots: { default: '点击' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('disabled 时不触发 click 事件', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: '禁用' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('loading 时不触发 click 事件', async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: '加载中' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
    // loading 时应显示旋转图标
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('block 属性撑满宽度', () => {
    const wrapper = mount(Button, {
      props: { block: true },
      slots: { default: '全宽' },
    })
    expect(wrapper.classes()).toContain('w-full')
  })

  it('size 属性控制尺寸', () => {
    const sm = mount(Button, { props: { size: 'sm' } })
    const lg = mount(Button, { props: { size: 'lg' } })
    expect(sm.classes()).toContain('h-7')
    expect(lg.classes()).toContain('h-10')
  })
})
