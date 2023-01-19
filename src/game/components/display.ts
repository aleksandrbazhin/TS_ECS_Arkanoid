import { Sprite } from "pixi.js";
import Const from "../const";

export default class DisplayComponent {
    constructor(public sprite: Sprite) {
        this.sprite.anchor.set(Const.SPRITE_ANCHOR);
    }
  }