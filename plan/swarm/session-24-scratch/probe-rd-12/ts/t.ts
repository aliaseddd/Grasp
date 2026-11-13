export const WASM_LOOP: Uint8Array<ArrayBuffer> = /* @__PURE__ */ new Uint8Array([0]);
interface Env { readonly wasm: { instantiate(bytes: Uint8Array): Promise<{ instance: { exports: Record<string, unknown> } }> } | null; }
interface Env2 { readonly wasm: { instantiate(bytes: Uint8Array<ArrayBuffer>): Promise<{ instance: { exports: Record<string, unknown> } }> } | null; }
export const a: Env = { wasm: typeof WebAssembly === 'object' ? { instantiate: (bytes) => WebAssembly.instantiate(bytes as BufferSource) } : null };
export const b: Env2 = { wasm: typeof WebAssembly === 'object' ? WebAssembly : null };
export const c: Env2 = { wasm: typeof WebAssembly === 'object' ? { instantiate: (bytes) => WebAssembly.instantiate(bytes) } : null };
// IndexedDB put of unknown, Blob worker
export function w(): Worker { const url = URL.createObjectURL(new Blob(['x'], { type: 'text/javascript' })); return new Worker(url); }
