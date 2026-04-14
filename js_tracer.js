function jsTracerWorkerWrapper() {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/acorn/8.10.0/acorn.min.js');

    self.onmessage = function(e) {
        let code = e.data;
        let ast;
        try {
          ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });
        } catch(err) {
          postMessage({ ok: false, err: "SyntaxError: " + err.message });
          return;
        }

        const insertions = [];
        let _nextObjId = 1;
        
        function insert(pos, str) {
          insertions.push({ pos, str });
        }

        // Simple AST walker
        function walk(node, visitor) {
          if (!node || typeof node !== 'object') return;
          if (Array.isArray(node)) {
            node.forEach(n => walk(n, visitor));
            return;
          }
          if (node.type) {
            if (visitor.enter) visitor.enter(node);
            for (const key in node) {
              if (key === 'parent') continue;
              const child = node[key];
              if (child && typeof child === 'object') {
                if (!Array.isArray(child)) child.parent = node;
                walk(child, visitor);
              }
            }
            if (visitor.exit) visitor.exit(node);
          }
        }

        walk(ast, {
          enter: (node) => {
            const type = node.type;
            const bodyLoc = node.body ? node.body.loc : node.loc;
            
            // Statements: Before they execute
            if (
              type.endsWith('Statement') || type === 'VariableDeclaration'
            ) {
              if (type !== 'BlockStatement' && node.parent?.type !== 'ForStatement') {
                const line = node.loc.start.line;
                insert(node.start, "__step__(" + line + ", 'line');\n");
              }
            }
            
            // Track variables inside function parameters
            if (type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression') {
              node.params.forEach(p => {
                 if (p.type === 'Identifier') {
                   // Inject inside body
                   const bodyStart = node.body.type === 'BlockStatement' ? node.body.start + 1 : node.body.start;
                   insert(bodyStart, "__var__('" + p.name + "', " + p.name + ");\n");
                 }
              });
              const fnName = node.id ? node.id.name : '<anonymous>';
              const line = node.loc.start.line;
              const blockStart = node.body.type === 'BlockStatement' ? node.body.start + 1 : node.body.start;
              insert(blockStart, "__enter__(" + line + ", '" + fnName + "');\n");
              
              if (node.body.type === 'BlockStatement') {
                 insert(node.body.end - 1, "\n__exit__(" + node.loc.end.line + ");\n");
              }
            }

            // Return exits frame
            if (type === 'ReturnStatement') {
               insert(node.start, "__exit__(" + node.loc.start.line + ");\n");
            }

            // Variable assignments and declarations
            if (type === 'VariableDeclarator' && node.id.type === 'Identifier') {
               insert(node.end, "; __var__('" + node.id.name + "', " + node.id.name + ");\n");
            }
            if (type === 'AssignmentExpression' && node.left.type === 'Identifier') {
               insert(node.end, "; __var__('" + node.left.name + "', " + node.left.name + ");\n");
            }
          }
        });

        insertions.sort((a,b) => b.pos - a.pos);
        let instrumented = code;
        for (const ins of insertions) {
           instrumented = instrumented.slice(0, ins.pos) + ins.str + instrumented.slice(ins.pos);
        }

        // 3. Execution Environment
        const _steps = [];
        const _frames = [{ fn: '<global>', locals: {} }];
        const _heap = new Map();
        let _stepCount = 0;

        function _pyTutorSerialize(val, seen) {
           if (val === null) return { t: 'None', v: null };
           if (typeof val === 'undefined') return { t: 'None', v: null };
           if (typeof val === 'boolean') return { t: 'bool', v: val };
           if (typeof val === 'number') return { t: val % 1 === 0 ? 'int' : 'float', v: val };
           if (typeof val === 'string') return { t: 'str', v: val };
           if (typeof val === 'function') return { t: 'fn', r: val.name || '<anonymous>' };
           if (typeof val === 'object') {
               if (seen.has(val)) return { t: Array.isArray(val)? 'list':'dict', id: seen.get(val) };
               const id = _nextObjId++;
               seen.set(val, id);
               if (Array.isArray(val)) {
                   return { t: 'list', id, items: val.map(v => _pyTutorSerialize(v, seen)) };
               } else {
                   const attrs = {};
                   for (const k in val) attrs[k] = _pyTutorSerialize(val[k], seen);
                   return { t: 'dict', id, attrs };
               }
           }
           return { t: '?', v: String(val) };
        }

        function __step__(line, ev) {
          if (_stepCount++ > 1000) throw new Error("Trace limit exceeded");
          const seen = new Map();
          const framesCopy = _frames.map(f => {
             const localsCopy = {};
             for (const k in f.locals) localsCopy[k] = _pyTutorSerialize(f.locals[k], seen);
             return { fn: f.fn, locals: localsCopy };
          });
          _steps.push({ line, ev, fn: _frames[_frames.length-1].fn, frames: framesCopy, mem: { heap: seen.size * 64 } });
        }

        function __var__(name, val) {
          if (_frames.length > 0) {
             _frames[_frames.length - 1].locals[name] = val;
          }
        }

        function __enter__(line, fnName) {
          _frames.push({ fn: fnName, locals: {} });
          __step__(line, 'call');
        }

        function __exit__(line) {
          __step__(line, 'return');
          _frames.pop();
        }
        
        const console = {
          log: (...args) => {
             // Basic log intercept stub
          }
        };

        try {
          const runner = new Function('console', '__step__', '__enter__', '__exit__', '__var__', instrumented);
          runner(console, __step__, __enter__, __exit__, __var__);
          postMessage({ ok: true, steps: _steps });
        } catch(e) {
          postMessage({ ok: false, err: e.message });
        }
    };
}

function buildJsTracerWorker(code) {
    // Generate the worker script text by converting the function to a string
    return '(' + jsTracerWorkerWrapper.toString() + ')();';
}
