import rnnoiseWorkletProcessorUrl from '../public/rnnoise/rnnoise-worklet-processor.js?url'
import rnnoiseWasmUrl from '../public/rnnoise/rnnoise.wasm?url'

export class RnnoiseWorklet {
  // 音频上下文实例
  audioContext = new AudioContext()

  rnnoiseWorkletNode?: AudioWorkletNode

  rnnoiseWasmBuffer?: ArrayBuffer

  constructor() {}

  createRnnoiseWorkletNode = async (audioContext: AudioContext) => {
    this.destroy()
    this.audioContext = audioContext

    await this.audioContext.audioWorklet.addModule(rnnoiseWorkletProcessorUrl)
    this.rnnoiseWorkletNode = new AudioWorkletNode(this.audioContext, 'rnnoise-worklet-processor')

    if (!this.rnnoiseWasmBuffer) {
      const response = await fetch(rnnoiseWasmUrl)
      this.rnnoiseWasmBuffer = await response.arrayBuffer()
    }

    this.rnnoiseWorkletNode?.port.postMessage({ type: 'init', rnnoiseWasmBuffer: this.rnnoiseWasmBuffer, debug: false })

    return this.rnnoiseWorkletNode
  }

  destroy = () => {
    this.rnnoiseWorkletNode?.disconnect()
    this.rnnoiseWorkletNode?.port.postMessage({ type: 'destroy' })
    this.rnnoiseWorkletNode = undefined
  }
}
