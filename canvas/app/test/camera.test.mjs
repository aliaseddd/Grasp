// The camera of a plane, as a person meets it: moving, zooming, the zoom's readout, fitting, and nothing sliding.
// THE SCAFFOLD'S SKELETON: package 2-14 owns this file and writes its tests, with the camera's keys
// (core/actions/camera.ts) and the readout (plane/ZoomReadout.tsx), in the slice's first round.
//
// The file holds no test yet. Its five tests are lines 8 to 11 and 15 of plan/slice-2.md, section 7, and each is
// written under exactly the name its line gives, because capabilities.test.mjs looks for that name here:
//
//    8. a plane is moved by a drag of the ground, by the wheel, by the middle button and by the arrow keys
//    9. a plane zooms by Ctrl with the wheel, by its buttons and by the + and - keys
//   10. the zoom buttons show the zoom as a percentage
//   11. 0 fits the view, as the fit button does
//   15. nothing on a plane has a transition, with reduced motion asked for or not
//
// What is decided for the camera (section 8, "Package 2-14"; section 5, the rows of camera.ts): `+` and `-` zoom by a
// step of 1.2 about the middle of the plane, and `=` and `_` are read as them; an arrow moves the plane by 80 px; `0`
// fits, as the fit button does; ZoomReadout stands between the zoom buttons and reads "100%", from the store's
// watchZoom. Where a key is the page's is section 5's rule: none of these keys acts from a text field, and the arrows
// do not act from inside a tree, a menu, a listbox, a tablist, a radiogroup or a grid. A view with no camera refuses
// in a sentence, which refusals.test.mjs holds: "No view is in front." or "<A grid view> has no zoom: it scrolls."
//
// The tests run in the page, from file://, through helpers.mjs, and each ends by checking that the page logged no
// error and no warning (section 6). A plane is already moved by a drag of its ground, by the wheel and by the middle
// button, and zoomed by Ctrl with the wheel and by its buttons, before the camera's rows are built: what each test
// fails for first is its keys, and for line 10 the readout.
