(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[{name:`Mandelbrot`,shader:`struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Transform screen coordinates to complex plane using uniforms
    let c = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom; 
    var z = vec2<f32>(0.0, 0.0);
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        z = vec2<f32>(
            z.x * z.x - z.y * z.y + c.x,
            2.0 * z.x * z.y + c.y
        );

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}`,centre:{x:-.5,y:0},zoom:1},{name:`Julia Set`,shader:`struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Julia Set: z starts at the coordinate, c is fixed
    let c = vec2<f32>(-0.7, 0.27015); // Classic Julia set parameter
    var z = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom;
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        z = vec2<f32>(
            z.x * z.x - z.y * z.y + c.x,
            2.0 * z.x * z.y + c.y
        );

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}
`,centre:{x:0,y:0},zoom:1.5},{name:`Burning Ship`,shader:`struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Burning Ship fractal: uses absolute values in the iteration
    let c = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom; 
    var z = vec2<f32>(0.0, 0.0);
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        // Take absolute value before squaring
        z = vec2<f32>(abs(z.x), abs(z.y));
        z = vec2<f32>(
            z.x * z.x - z.y * z.y + c.x,
            2.0 * z.x * z.y + c.y
        );

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}
`,centre:{x:-.5,y:-.5},zoom:.7},{name:`Tricorn`,shader:`struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Tricorn (Mandelbar): uses complex conjugate (negative imaginary part)
    let c = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom; 
    var z = vec2<f32>(0.0, 0.0);
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        z = vec2<f32>(
            z.x * z.x - z.y * z.y + c.x,
            -2.0 * z.x * z.y + c.y  // Negative creates the conjugate
        );

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}
`,centre:{x:-.5,y:0},zoom:1},{name:`Multibrot (z³)`,shader:`struct Uniforms {
    centre: vec2<f32>,
    zoom: f32,
    aspect_ratio: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    //triangle bigger than the screen:
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(-1.0, -1.0), // Bottom Left
        vec2<f32>( 3.0, -1.0), // Far Right (outside screen)
        vec2<f32>(-1.0,  3.0)  // Far Top (outside screen)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.worldPos = pos[vertexIndex];
    return output;
}

// Convert HSV to RGB for colorful visualization
fn hsv2rgb(h: f32, s: f32, v: f32) -> vec3<f32> {
    let c = v * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = v - c;
    
    var rgb: vec3<f32>;
    if (h < 0.166667) {
        rgb = vec3<f32>(c, x, 0.0);
    } else if (h < 0.333333) {
        rgb = vec3<f32>(x, c, 0.0);
    } else if (h < 0.5) {
        rgb = vec3<f32>(0.0, c, x);
    } else if (h < 0.666667) {
        rgb = vec3<f32>(0.0, x, c);
    } else if (h < 0.833333) {
        rgb = vec3<f32>(x, 0.0, c);
    } else {
        rgb = vec3<f32>(c, 0.0, x);
    }
    
    return rgb + vec3<f32>(m, m, m);
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    // Multibrot (z^3): generalization of Mandelbrot to higher powers
    let c = uniforms.centre + (in.worldPos * vec2<f32>(uniforms.aspect_ratio, 1.0)) / uniforms.zoom; 
    var z = vec2<f32>(0.0, 0.0);
    var iter: i32 = 0;
    let max_iter: i32 = 256;

    for (var i = 0; i < max_iter; i++) {
        // z^3 = (x + iy)^3 = x^3 - 3xy^2 + i(3x^2y - y^3)
        let z_real = z.x * z.x * z.x - 3.0 * z.x * z.y * z.y + c.x;
        let z_imag = 3.0 * z.x * z.x * z.y - z.y * z.y * z.y + c.y;
        z = vec2<f32>(z_real, z_imag);

        if (dot(z, z) > 4.0) { 
            iter = i;
            break; 
        }
    }

    // Points in the set are black
    if (iter == 0 || iter >= max_iter - 1) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Smooth coloring for points outside the set
    let zn = length(z);
    let smooth_iter = f32(iter) + 1.0 - log2(log2(zn));
    
    // Map to hue with saturation and value
    let hue = (smooth_iter / 50.0) % 1.0;
    let saturation = 0.8;
    let value = 0.9;
    
    let rgb = hsv2rgb(hue, saturation, value);
    return vec4<f32>(rgb, 1.0);
}
`,centre:{x:0,y:0},zoom:1.2}];async function t(){if(!navigator.gpu){alert(`WebGPU is not supported in this browser.`);return}let t=await(await navigator.gpu.requestAdapter()).requestDevice(),n=document.getElementById(`gpuCanvas`),r=n.getContext(`webgpu`),i=navigator.gpu.getPreferredCanvasFormat();function a(){n.width=window.innerWidth,n.height=window.innerHeight}a(),r.configure({device:t,format:i,alphaMode:`premultiplied`});let o=t.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=0,c={...e[0].centre},l=e[0].zoom,u=n.width/n.height,d=document.createElement(`div`);d.style.position=`fixed`,d.style.top=`20px`,d.style.left=`20px`,d.style.color=`white`,d.style.fontFamily=`monospace`,d.style.fontSize=`16px`,d.style.backgroundColor=`rgba(0, 0, 0, 0.7)`,d.style.padding=`10px 15px`,d.style.borderRadius=`5px`,d.style.zIndex=`1000`,document.body.appendChild(d);function f(){d.textContent=`${s+1}. ${e[s].name} | Press 1-5 to switch`}f();let p,m;function h(){let n=t.createShaderModule({code:e[s].shader});p=t.createRenderPipeline({layout:`auto`,vertex:{module:n,entryPoint:`vs_main`},fragment:{module:n,entryPoint:`fs_main`,targets:[{format:i}]},primitive:{topology:`triangle-list`}}),m=t.createBindGroup({layout:p.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:o}}]})}h();function g(){let e=new Float32Array([c.x,c.y,l,u]);t.queue.writeBuffer(o,0,e);let n=t.createCommandEncoder(),i={colorAttachments:[{view:r.getCurrentTexture().createView(),clearValue:{r:.1,g:.1,b:.1,a:1},loadOp:`clear`,storeOp:`store`}]},a=n.beginRenderPass(i);a.setPipeline(p),a.setBindGroup(0,m),a.draw(3),a.end(),t.queue.submit([n.finish()])}let _=!1,v={x:0,y:0};n.addEventListener(`mousedown`,e=>{_=!0,v={x:e.clientX,y:e.clientY}}),n.addEventListener(`mouseup`,()=>{_=!1}),n.addEventListener(`mouseleave`,()=>{_=!1}),n.addEventListener(`mousemove`,e=>{if(!_)return;let t=e.clientX-v.x,r=e.clientY-v.y,i=2/l;c.x-=t/n.width*i*u,c.y+=r/n.height*i,v={x:e.clientX,y:e.clientY},g()}),n.addEventListener(`wheel`,e=>{e.preventDefault();let t=n.getBoundingClientRect(),r=(e.clientX-t.left)/n.width*2-1,i=-((e.clientY-t.top)/n.height*2-1),a=c.x+r*u/l,o=c.y+i/l,s=e.deltaY>0?.9:1.1;l*=s,c.x=a-r*u/l,c.y=o-i/l,g()}),window.addEventListener(`keydown`,t=>{let n=parseInt(t.key);n>=1&&n<=e.length&&(s=n-1,c={...e[s].centre},l=e[s].zoom,h(),f(),g())}),window.addEventListener(`resize`,()=>{a(),u=n.width/n.height,g()}),g()}t();