import React, { createRef, useEffect } from 'react';
import Matrix4 from 'Matrix4';
// 立方体
export default function Cube () {
  const domRef = createRef();
  useEffect(() => {
    if (domRef.current) {
      const dom = domRef.current;
      const gl = dom.getContext('webgl');
      const VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 a_mvpMatrix;
        varying vec4 u_Color;
        void main () {
          gl_Position = a_mvpMatrix * a_Position;
          u_Color = a_Color;
        }
      `;
      const FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 u_Color;
        void main () {
          gl_FragColor = u_Color;
        }
      `;
      const vshader = gl.createShader(gl.VERTEX_SHADER);
      const fshader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vshader, VSHADER_SOURCE);
      gl.shaderSource(fshader, FSHADER_SOURCE);
      gl.compileShader(vshader);
      gl.compileShader(fshader);
      if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS) || !gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        throw new Error('着色器初始化失败')
      }

      const program = gl.createProgram();
      gl.attachShader(program, vshader);
      gl.attachShader(program, fshader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const aPosition = gl.getAttribLocation(program, 'a_Position');
      const aColor = gl.getAttribLocation(program, 'a_Color');
      const aMvpMatrix = gl.getUniformLocation(program, 'a_mvpMatrix');

      const sp = [
        [], [-1.0, 1.0, 1.0], [-1.0, -1.0, 1.0], [1.0, 1.0, 1.0], [1.0, -1.0, 1.0],
        [-1.0, 1.0, -1.0], [-1.0, -1.0, -1.0], [1.0, 1.0, -1.0], [1.0, -1.0, -1.0],
      ];
      const sc = [
        [], [1.0, 0.3, 0.3], [0.3, 0.3, 1.0], [1.0, 1.0, 0.4], [0.4, 1.0, 0.4], [0.4, 1.0,1.0], [1.0,0.4 ,1.0]
      ];
      const points = new Float32Array([
        ...sp[1],...sp[2], ...sp[3],  ...sp[4], // 前
        ...sp[5], ...sp[6], ...sp[7],  ...sp[8], // 后
        ...sp[5],...sp[1], ...sp[2], ...sp[6], // 左
        ...sp[7],...sp[3], ...sp[8], ...sp[4], // 右
        ...sp[5],...sp[1], ...sp[7], ...sp[3], // 上
        ...sp[6],...sp[2], ...sp[8], ...sp[4], // 下
      ]);

      const colors = new Float32Array([
        ...sc[1],...sc[1], ...sc[1], ...sc[1], // 前
        ...sc[2],...sc[2], ...sc[2], ...sc[2], // 后
        ...sc[3],...sc[3], ...sc[3], ...sc[3], // 左
        ...sc[4],...sc[4], ...sc[4], ...sc[4], // 右
        ...sc[5],...sc[5], ...sc[5], ...sc[5], // 上
        ...sc[6],...sc[6], ...sc[6], ...sc[6], // 下
      ])

      const pointBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
      gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPosition);
      
      const colorBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aColor);

      const viewMatrix = new Matrix4();
      const perMatrix = new Matrix4();
      const mvpMatrix = new Matrix4();
      viewMatrix.setLookAt(3,3,7, 0.0,0.0,0, 0.0,1.0,0.0);
      perMatrix.setPerspective(30,domRef.current.width/domRef.current.height, 1,100);
      mvpMatrix.set(perMatrix).multiply(viewMatrix);
      gl.uniformMatrix4fv(aMvpMatrix, false, mvpMatrix.elements);

      const indicas = new Uint8Array([
        0, 1, 2, 1, 2,3,
        4,5,6,5,6,7,
        8,9,10,8,10,11,
        12,13,14, 13,14, 15,
        16,17,18, 17,18,19,
        20,21, 22,21,22,23
      ]);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicas, gl.STATIC_DRAW);

      gl.clearColor(0.0,0.0,0.0,1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
    }
  }, [domRef]);

  return <div>
  <canvas ref={domRef} width="500" height="500"/>
</div>
}