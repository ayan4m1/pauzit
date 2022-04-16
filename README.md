# pauzit

# purpose

Pauzit is a command-line utility which can help you with single extruder multi material (SEMM) 3D printing.

Specifically, it takes the g-code output from PrusaSlicer and replaces toolchange commands with M600 (Marlin filament change) commands.

This allows you to make SEMM prints without any special hardware, by manually swapping filament when necessary instead of using a mixing extruder or MMU.

# usage

> npx pauzit convert input.gcode output.gcode

If you omit the output filename, a new file named `{input}.pauz.gcode` will be created.
