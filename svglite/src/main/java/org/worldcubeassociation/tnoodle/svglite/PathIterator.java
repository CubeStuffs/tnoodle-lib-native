package org.worldcubeassociation.tnoodle.svglite;

import java.util.List;

public class PathIterator {
    public static final int SEG_MOVETO = 0;
    public static final int SEG_LINETO = 1;
    public static final int SEG_CLOSE = 4;

    public static final String SVG_LANGUAGE_COMMANDS = "MLTCZ";

    private int index;
    private final List<Path.Command> commands;
    public PathIterator(Path p) {
        index = 0;
        commands = p.commands;
    }

    public boolean isDone() {
        return index >= commands.size();
    }

    public void next() {
        index++;
    }

    public int currentSegment(double[] coords) {
        Path.Command command = commands.get(index);
        assert coords.length >= command.coords.length;
        for(int i = 0; i < command.coords.length; i++) {
            coords[i] = command.coords[i];
        }
        return command.type;
    }

}
