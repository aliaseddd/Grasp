import type { StrongholdModule } from '../../shell/module';

/**
 * The hello-world module: the smallest module there can be, so the proof can watch its file load on its own
 * (ARCHITECTURE.md, The proof, step 2). It draws one line and takes it down again.
 */
export const hello: StrongholdModule = {
  id: 'hello',
  mount(root) {
    const line = document.createElement('p');
    line.textContent = 'Hello world!';
    root.append(line);
    return () => {
      line.remove();
    };
  },
};
