import { Sprite, Texture } from "pixi.js";

export default class DisplayComponent {
    public sprite: Sprite;
    constructor(texture: Texture) {
        this.sprite = Sprite.from(texture);
        this.sprite.anchor.set(0.5);
    }
  }