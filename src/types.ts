export type Position2D = {
    x: number,
    y: number,
}

export type OverlayTextureType = {
    id: number,
    imageData: string,
    position: Position2D,
    width: number,
    height: number,
    opacity: number,
}

export type TranspGradientType = {
    tb: number,
    bt: number,
    rl: number,
    lr: number,
    rad: number,
}