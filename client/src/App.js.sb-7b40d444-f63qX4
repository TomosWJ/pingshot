<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2685.3">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">import { useEffect, useRef, useState } from "react";</p>
<p class="p2"><br></p>
<p class="p1">const WIDTH = 1000;</p>
<p class="p1">const HEIGHT = 700;</p>
<p class="p2"><br></p>
<p class="p1">export default function App() {</p>
<p class="p1"><span class="Apple-converted-space">  </span>const canvasRef = useRef(null);</p>
<p class="p1"><span class="Apple-converted-space">  </span>const socketRef = useRef(null);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>const [players, setPlayers] = useState([]);</p>
<p class="p1"><span class="Apple-converted-space">  </span>const [myId, setMyId] = useState(null);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>const input = useRef({</p>
<p class="p1"><span class="Apple-converted-space">    </span>up: false,</p>
<p class="p1"><span class="Apple-converted-space">    </span>down: false,</p>
<p class="p1"><span class="Apple-converted-space">    </span>left: false,</p>
<p class="p1"><span class="Apple-converted-space">    </span>right: false,</p>
<p class="p1"><span class="Apple-converted-space">    </span>angle: 0,</p>
<p class="p1"><span class="Apple-converted-space">  </span>});</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// CONNECT TO SERVER</p>
<p class="p1"><span class="Apple-converted-space">  </span>useEffect(() =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const socket = new WebSocket("ws://YOUR_SERVER_IP:3001");</p>
<p class="p1"><span class="Apple-converted-space">    </span>socketRef.current = socket;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>socket.onopen = () =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>console.log("Connected");</p>
<p class="p1"><span class="Apple-converted-space">      </span>socket.send(JSON.stringify({ type: "join", name: "Tomos" }));</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>socket.onmessage = (event) =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>const msg = JSON.parse(event.data);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>if (msg.type === "welcome") {</p>
<p class="p1"><span class="Apple-converted-space">        </span>setMyId(msg.id);</p>
<p class="p1"><span class="Apple-converted-space">      </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>if (msg.type === "snapshot") {</p>
<p class="p1"><span class="Apple-converted-space">        </span>setPlayers(msg.players);</p>
<p class="p1"><span class="Apple-converted-space">      </span>}</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p1"><span class="Apple-converted-space">  </span>}, []);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// INPUT</p>
<p class="p1"><span class="Apple-converted-space">  </span>useEffect(() =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const handleKeyDown = (e) =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "w") input.current.up = true;</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "s") input.current.down = true;</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "a") input.current.left = true;</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "d") input.current.right = true;</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>const handleKeyUp = (e) =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "w") input.current.up = false;</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "s") input.current.down = false;</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "a") input.current.left = false;</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (e.key === "d") input.current.right = false;</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>window.addEventListener("keydown", handleKeyDown);</p>
<p class="p1"><span class="Apple-converted-space">    </span>window.addEventListener("keyup", handleKeyUp);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>return () =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>window.removeEventListener("keydown", handleKeyDown);</p>
<p class="p1"><span class="Apple-converted-space">      </span>window.removeEventListener("keyup", handleKeyUp);</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p1"><span class="Apple-converted-space">  </span>}, []);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// MOUSE AIM</p>
<p class="p1"><span class="Apple-converted-space">  </span>useEffect(() =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const handleMouseMove = (e) =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>const rect = canvasRef.current.getBoundingClientRect();</p>
<p class="p1"><span class="Apple-converted-space">      </span>const x = e.clientX - rect.left;</p>
<p class="p1"><span class="Apple-converted-space">      </span>const y = e.clientY - rect.top;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>const me = players.find((p) =&gt; p.id === myId);</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (!me) return;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>const dx = x - me.x;</p>
<p class="p1"><span class="Apple-converted-space">      </span>const dy = y - me.y;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>input.current.angle = Math.atan2(dy, dx);</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>window.addEventListener("mousemove", handleMouseMove);</p>
<p class="p1"><span class="Apple-converted-space">    </span>return () =&gt; window.removeEventListener("mousemove", handleMouseMove);</p>
<p class="p1"><span class="Apple-converted-space">  </span>}, [players, myId]);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// SEND INPUT LOOP</p>
<p class="p1"><span class="Apple-converted-space">  </span>useEffect(() =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const interval = setInterval(() =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>if (!socketRef.current) return;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>socketRef.current.send(</p>
<p class="p1"><span class="Apple-converted-space">        </span>JSON.stringify({</p>
<p class="p1"><span class="Apple-converted-space">          </span>type: "input",</p>
<p class="p1"><span class="Apple-converted-space">          </span>...input.current,</p>
<p class="p1"><span class="Apple-converted-space">        </span>})</p>
<p class="p1"><span class="Apple-converted-space">      </span>);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}, 50);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>return () =&gt; clearInterval(interval);</p>
<p class="p1"><span class="Apple-converted-space">  </span>}, []);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>// RENDER LOOP</p>
<p class="p1"><span class="Apple-converted-space">  </span>useEffect(() =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">    </span>const ctx = canvasRef.current.getContext("2d");</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>const render = () =&gt; {</p>
<p class="p1"><span class="Apple-converted-space">      </span>ctx.fillStyle = "#111";</p>
<p class="p1"><span class="Apple-converted-space">      </span>ctx.fillRect(0, 0, WIDTH, HEIGHT);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>for (const p of players) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.fillStyle = p.color;</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.beginPath();</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.fill();</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>// direction line</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.strokeStyle = "#fff";</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.beginPath();</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.moveTo(p.x, p.y);</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.lineTo(</p>
<p class="p1"><span class="Apple-converted-space">          </span>p.x + Math.cos(p.angle) * 20,</p>
<p class="p1"><span class="Apple-converted-space">          </span>p.y + Math.sin(p.angle) * 20</p>
<p class="p1"><span class="Apple-converted-space">        </span>);</p>
<p class="p1"><span class="Apple-converted-space">        </span>ctx.stroke();</p>
<p class="p1"><span class="Apple-converted-space">      </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>requestAnimationFrame(render);</p>
<p class="p1"><span class="Apple-converted-space">    </span>};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>render();</p>
<p class="p1"><span class="Apple-converted-space">  </span>}, [players]);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>return (</p>
<p class="p1"><span class="Apple-converted-space">    </span>&lt;div&gt;</p>
<p class="p1"><span class="Apple-converted-space">      </span>&lt;canvas</p>
<p class="p1"><span class="Apple-converted-space">        </span>ref={canvasRef}</p>
<p class="p1"><span class="Apple-converted-space">        </span>width={WIDTH}</p>
<p class="p1"><span class="Apple-converted-space">        </span>height={HEIGHT}</p>
<p class="p1"><span class="Apple-converted-space">        </span>style={{ border: "1px solid white" }}</p>
<p class="p1"><span class="Apple-converted-space">      </span>/&gt;</p>
<p class="p1"><span class="Apple-converted-space">    </span>&lt;/div&gt;</p>
<p class="p1"><span class="Apple-converted-space">  </span>);</p>
<p class="p1">}</p>
</body>
</html>
