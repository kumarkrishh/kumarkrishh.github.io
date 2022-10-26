import React from 'react';
import ArticleLayout from '../components/ArticleLayout';
import Section from '../components/Section';
import HrefLink from '../components/HrefLink';

import { Async } from 'react-async';
import { fetchText } from '../utils/load';

import Tex from '@matejmazur/react-katex';

import AsideCard from '../components/AsideCard';

import { Prism as SyntaxHighligher } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import WebGL2SetupDemo from '../components/WebGL2SetupDemo';
import WebGL2HeatEqnDemo from '../components/WebGL2HeatEqnDemo';

import WebGL2SetupDemo_TsxUrl from "../assets/fluid1/WebGL2SetupDemo_tsx.txt?url";

import WebGL2HeatEqnDemo_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_tsx.txt?url";
import WebGL2HeatEqnDemo_BufferVars_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_BufferVars_tsx.txt?url";
import WebGL2HeatEqnDemo_BufferSetup_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_BufferSetup_tsx.txt?url";
import WebGL2HeatEqnDemo_Simulate_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_Simulate_tsx.txt?url";
import WebGL2HeatEqnDemo_FragmentShader_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_FragmentShader_tsx.txt?url";
import WebGL2HeatEqnDemo_RenderFragmentShader_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_RenderFragmentShader_tsx.txt?url";
import WebGL2HeatEqnDemo_ControlTexture_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_ControlTexture_tsx.txt?url";
import WebGL2HeatEqnDemo_ControlEdit_TsxUrl from "../assets/fluid1/WebGL2HeatEqnDemo_ControlEdit_tsx.txt?url";

import TextureCoordImgUrl from '../assets/fluid1/texturecoords.png';
import PingPongImgUrl from '../assets/fluid1/pingpong.png';

import { ArticleLink } from '../components/Articles';
import { articleData } from '../components/ArticleData';

type CodeBlockProps = {
  url: string,
  lang: string
}

function CodeBlock(props: CodeBlockProps) {
  return <Async promise={fetchText(props.url)}>
    <Async.Pending>
      <div className="spinner-border" role="status" />
    </Async.Pending>
    <Async.Fulfilled<string>>{code =>
      <SyntaxHighligher
        className="mx-5 mb-5"
        language={props.lang}
        showLineNumbers
        style={a11yDark}
        children={code}
      />
    }</Async.Fulfilled>
    <Async.Rejected>
      {/* TODO: put error here */}
      <div className="spinner-border" role="status" />
    </Async.Rejected>
  </Async>
}

const Fluid1 = () => <ArticleLayout>{
  ({ Citation, CitationBank }) => <>
    <Section id="overview" name="Overview">
      <p>
        Our goals are to:
      </p>
      <ul>
        <li>provide a brief introduction to WebGL and its uses</li>
        <li>demonstrate how to setup a simple WebGL program</li>
        <li>demonstrate how use WebGL to accelerate computations</li>
        <li>provide working code to simulate 2D heat transfer</li>
      </ul>
    </Section>
    <Section id="webgl-intro" name="WebGL Intro">
      <h4>What is WebGL2?</h4>
      <p>
        WebGL is a GPU accelerated graphics API for the web.
        It's more or less based on OpenGL, so if you're familiar with that, you should find it pretty similar.
        For now, it's the only way to interface with the GPU on the web.
        Sometime in the relatively near future we'll hopefully be seeing <a href="https://webgpu.rocks/">WebGPU</a> as well.
      </p>
      <p>
        WebGL2 is the newer version of WebGL.
        The original WebGL was based on OpenGL ES 2.0, but WebGL2 is based on OpenGL ES 3.0.
        WebGL2 adds a ton of new features, and it's now supported by nearly all modern devices, so there's really no reason not to use it.
      </p>
      <p>
        In this article, we'll be assuming at least a passing familiarity with WebGL.
        You should be familiar with:
      </p>
      <ul>
        <li>how the graphics pipeline works</li>
        <li>what vertex shaders do</li>
        <li>what fragment shaders do</li>
        <li>what a uniform is</li>
      </ul>
      <p>
        If you need a refresher, the following articles are a pretty good source:
      </p>
      <ul>
        <li><HrefLink href="https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html" /></li>
        <li><HrefLink href="https://webgl2fundamentals.org/webgl/lessons/webgl-how-it-works.html" /></li>
      </ul>
      <p>
        And here's a link to a WebGL API reference.
      </p>
      <ul>
        <li><HrefLink href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API" /></li>
      </ul>
    </Section>
    <Section id="webgl2-setup" name="Working with WebGL2">
      <h4>Why GPU?</h4>
      <p>
        Fluid simulations can be parallelized, which means that the work can be split up into chunks that run independently.
        Your CPU (if you're running on a reasonably normal computer) probably has 4-32 threads.
        So, we could theoretically speed up the simulation 32x by taking advantage of multi-threading (although in practice it might not be so high).
        However, your GPU has the capability to run far more threads simultaneously.
        Depending on exactly which card you have, you can have a couple thousand threads concurrently running.
        <Citation source="https://stackoverflow.com/questions/6490572/cuda-how-many-concurrent-threads-in-total" />.
      </p>
      <p>
        There are downsides to running on the GPU however.
        First of all, the GPU is limited in what it can do.
        Secondly, GPU code is deployed in a batch manner, where the same code is given to all cores of the GPU.
        And finally, you can't use system calls in GPU code.
        So things like reading from a file or making a network request are not allowed.
      </p>
      <p>
        Although there are caveats, the GPU is still the best choice for simple fluid simulations like this one.
        So, let's get started.
      </p>
      <h4>WebGL Setup</h4>
      <p>
        WebGL2 was primary designed as a graphics api, and not really so much as a general purpose GPU compute API.
        As such, we will have to make use of a few workarounds in order to be able to do what we want.
      </p>
      <p>
        Let's first look at setting up a canvas:
      </p>

      <AsideCard title="Canvas Setup" id="canvas-setup-demo">
        <p>
          Code:
        </p>
        <CodeBlock lang="tsx" url={WebGL2SetupDemo_TsxUrl} />
        <p>
          Result:
        </p>
        <WebGL2SetupDemo
          className="mx-auto mb-5"
          style={{ display: "block" }}
          size={400}
        />
      </AsideCard>
      <p>
        The code is mostly boilerplate associated with setting up WebGL.
        It draws two triangles, forming a suqare covering the entire clip space.
        If any of it is confusing, I reccomend reading some of the WebGL resources linked above.
      </p>
    </Section>
    <Section id="webgl2-heat" name="Heat Equation with WebGL2">
      <p>
        Now, we'll approach the heat equation, since it's a good starting point for dealing with interactive simulations.
      </p>
      <p>
        Here's the scenario:
        Imagine you have a uniform square metal plate.
        You're able to focus a hot blowtorch on some parts of the plate, and chill other parts with liquid nitrogen.
        What is the temperature of a given point on the plate?
      </p>
      <p>
        It turns out that it's pretty easy to simulate.
        We'll split our metal plate into a <Tex math="N" /> by <Tex math="N" /> square grid.
        Newton's law of cooling states that the rate of heat transfer is proportional to the difference in temperature.
        What this means is that in each timestep, for each cell, we set it to the average temperatures of its neighboring cells in the previous timestep.
      </p>
      <p>
        If you want to know why this works,
        you can check out this link: <HrefLink href="https://mattferraro.dev/posts/poissons-equation" />.
      </p>
      <h4>External Code</h4>
      <p>
        In the interest of not drowning in the boilerplate, some of the code has been factored out into two seperate JS files:
      </p>
      <ul>
        <li>
          <a href="https://github.com/pimpale/pimpale.github.io/blob/master/src/utils/webgl.ts">webgl.ts</a>
          : manage creating webgl textures and programs
        </li>
        <li>
          <a href="https://github.com/pimpale/pimpale.github.io/blob/master/src/utils/canvas.ts">canvas.ts</a>
          : manages tracking the position of the mouse on the cursor when mouse is clicked
        </li>
      </ul>
      <h4>Implementation</h4>
      <p>
        To implement it, we'll have to make several changes to our old boilerplate code.
      </p>
      <ul>
        <li>Adding a mutable heat buffer on the GPU.</li>
        <li>Adding a control buffer on the GPU that determines which cells are pinned.</li>
        <li>Adding a program that computes the next state of the heat.</li>
        <li>Adding a way to render the heat data.</li>
        <li>Adding a way to edit the control buffer.</li>
      </ul>
      <h5>Adding a mutable heat buffer on the GPU.</h5>
      <p>
        Adding mutable data on the GPU is quite tricky.
        Since WebGL was primarily defined as a graphics rendering API,
        not a general purpose compute system,
        we'll have to abuse some rendering features to get what we want.
      </p>
      <p>
        The basic plan is to store our heat data in a texture.
        Since textures are more or less 2D arrays, this works great for our purposes.
        However, WebGL doesn't let us mutate a texture during shader execution.
      </p>
      <p>
        So, in order to simulate one timestep
        we can render a <Tex math="N" /> by <Tex math="N" /> image,
        which will run a fragment shader for each pixel in the output.
        In the fragment shader, we'll do the work of computing the average of the neighboring pixels.
        We can take the output of that rendering, and stick it into a framebuffer.
      </p>
      <p>
        In the next timestep, we'll swap buffers. We'll use the data we just rendered into the framebuffer as the source data.
        We'll render to the framebuffer linked to the place we stored our original heat data in the first frame.
      </p>
      <p>
        In this way, we'll "ping-pong" between the two textures.
      </p>
      <figure className="col text-center">
        <img alt="WebGL texture coordinate system" className="d-block mx-auto" style={{ width: "30em" }} src={PingPongImgUrl} />
        <figcaption>Source: Own Work</figcaption>
        <p>Ping Ponging between Textures</p>
      </figure>
      <AsideCard title="HeatEqn Texture/Framebuffer Setup">
        <p>
          Defining Texture/Framebuffer pair:
        </p>
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_BufferVars_TsxUrl} />
        <p>
          Initializing Texture/Framebuffer pair:
        </p>
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_BufferSetup_TsxUrl} />
        <p>
          Running the simulation:
        </p>
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_Simulate_TsxUrl} />
      </AsideCard>

      <h5>Adding a control buffer on the GPU</h5>
      <p>
        Now that we know how to add one texture to the GPU, it's quite easy to add another.
      </p>
      <p>
        We're going to be editing the control buffer solely from the CPU side.
        Therefore, since it doesn't need to be mutable from the shader, it's substantially easier to manage.
        No ping-ponging is necessary!
      </p>
      <AsideCard title="HeatEqn Control Texture Setup">
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_ControlTexture_TsxUrl} />
      </AsideCard>

      <h5>Adding a program that computes the next state of the heat</h5>
      <p>
        Now that we've set up our control texture and our two temperature framebuffer-texture pairs,
        we can write the code to read from one and write to the other.
      </p>
      <p>
        The vertex shader can be reused as is from the WebGL setup code.
        All the actual work of simulation happens in the fragment shader.
      </p>
      <p>
        What this shader does is conceptually pretty simple.
        It gets the heat data from the 4 adjacent points on the <code>u_tex</code> texture (which represents the temperature at a given location at the previous timestep).
        It then averages them together to get the next temperature.
      </p>
      <p>
        One tricky point is that we need to calculate how far away each neighboring pixel is.
        In WebGL, texture coordinates are measured from 0 to 1, regardless of the size of the original image.
        So, we need to get the texture's size in order to calculate how far away (in texture coordinates) a neighboring pixel is.
      </p>
      <p>
        Also in this fragment, we add a texture called <code>u_ctrl_tex</code>.
        Based on the value stored in this texture, we decide whether to normally calculate the that would be here in the next timestep,
        or whether to set to a fixed hot or cold temperature.
      </p>
      <AsideCard title="HeatEqn Heat Fragment Shader">
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_FragmentShader_TsxUrl} />
      </AsideCard>
      <h5>Adding a way to render the heat data</h5>
      <p>
        We can write another fragment shader to handle rendering the heat data to the canvas.
      </p>
      <p>
        In order to make it look good, we use the inferno colorscheme,
        using code from here: <HrefLink href="https://www.shadertoy.com/view/WlfXRN" />.
      </p>
      <AsideCard title="HeatEqn Render Fragment Shader">
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_RenderFragmentShader_TsxUrl} />
      </AsideCard>
      <h5>Adding a way to edit the control buffer</h5>
      <p>
        The final part of our program is adding a way to edit the control buffer.
        There isn't anything particularly interesting from a algorithmic standpoint here.
      </p>
      <p>
        One common source of errors is that the coordinate system of WebGL has
        its origin on the bottom left, not the top left.
        So, the <Tex math="y" />-axis has the opposite orientation of HTML's <Tex math="y" />-axis.
      </p>
      <figure className="col text-center">
        <img alt="WebGL texture coordinate system" className="d-block mx-auto" style={{ width: "30em" }} src={TextureCoordImgUrl} />
        <figcaption>Source: Own Work</figcaption>
        <p>WebGL Texture Coordinate system</p>
      </figure>
      <AsideCard title="HeatEqn Render Fragment Shader">
        <p>
          Added at the beginning of the animationLoop method:
        </p>
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_ControlEdit_TsxUrl} />
      </AsideCard>

      <h4>The Final Product</h4>
      <p>
        Now, let's bring it all together.
        The code for the entire operation is quite long, but you can click the dropdown to view it here in its full glory:
      </p>
      <details className="mb-3 mx-5">
        <summary>Full Code (long!)</summary>
        <CodeBlock lang="tsx" url={WebGL2HeatEqnDemo_TsxUrl} />
      </details>
      <p>
        It's also available on github here: <HrefLink href="https://github.com/pimpale/pimpale.github.io/blob/master/src/components/WebGL2HeatEqnDemo.tsx" />
      </p>
      <AsideCard title="Heat Equation" id="heat-equation-demo">
        <p>
          Drag your mouse across the canvas to draw.
        </p>
        <p>
          Use the dropdown menu to select whether to draw with hot, cold, or switch to eraser mode.
        </p>
        <p>
          Use button to reset canvas to default.
        </p>
        <WebGL2HeatEqnDemo
          className="mx-auto"
          style={{ maxWidth: "40em" }}
          size={400}
        />

      </AsideCard>
    </Section>
    <Section id="conclusion" name="Conclusion">
      <h4>Summary</h4>
      <p>
        It's somewhat more difficult to use WebGL2 to simulate than using plain JS,
        but it's a lot faster, especially for very parallelizable problems.
      </p>
      <p>
        We learned how to setup a WebGL to simulate and render a simple numerical simulation
        calculating heat transfer.
      </p>
      <h4>Next Time</h4>
      <p>
        In the next article, we'll:
      </p>
      <ul>
        <li>explain simply the math behind fluid simulation</li>
        <li>learn how to use the Navier-Stokes equations to simulate fluids</li>
        <li>provide working code to simulate 2D incompressible flow</li>
      </ul>
      <p>Link:</p>
      <ul>
        <li><ArticleLink a={articleData.get("fluid2")!} /></li>
      </ul>
    </Section>
    <Section id="sources" name="Sources">
      <CitationBank />
    </Section>
  </>
}</ArticleLayout>


// Bootstrap CSS & JS
import '../styles/style.scss';
import 'bootstrap/dist/js/bootstrap';

import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Fluid1 />
  </React.StrictMode>,
);
