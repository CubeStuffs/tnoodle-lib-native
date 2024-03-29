package org.worldcubeassociation.tnoodle.scrambleanalysis;

import cs.min2phase.Search;
import cs.min2phase.SearchWCA;
import org.worldcubeassociation.tnoodle.puzzle.CubePuzzle;

import static org.worldcubeassociation.tnoodle.scrambleanalysis.utils.StringUtils.stringCompareIgnoringOrder;

public class CubeHelper {
    // For 3x3 only.

    private static final int edges = 12;
    private static final int central = 4; // Index 4 represents the central sticker;
    private static final int stickersPerFace = 9;

    private static final int corners = 8;

    // Refer to toFaceCube representation.
    // For FB edge orientation, we only care about edges on U/D, Equator F/B.
    // Also, this sets an order to edges, which will be reused
    // UB, UL, UR, UF
    // DF, DL, DR, DB
    // FL, FR
    // BR, BL
    private static final int[] edgesIndex = {1, 3, 5, 7, // U edges index
        28, 30, 32, 34, // D edges index
        21, 23, // Equator front
        48, 50 // Equator back
    };

    // Each edge has 2 stickers. This array represents, respectively, the index of
    // the other attached sticker.
    private static final int[] attachedEdgesIndex = {46, 37, 10, 19, // Attached to the U face.
        25, 43, 16, 52, // Attached to the D face
        41, 12, // Attached to Equator front
        14, 39 // Attached to Equator back
    };

    // Again, an order to corners
    // UBL, UBR, UFL, UFR,
    // DFL, DFR, DBL, DBR
    private static final int[] cornersIndex = {0, 2, 6, 8, // U corners
        27, 29, 33, 35}; // D corners
    private static final int[] cornersIndexClockWise = {36, 45, 18, 9, // U twist clockwise
        44, 26, 53, 17, // D stickers
    };
    private static final int[] cornersIndexCounterClockWise = {47, 11, 38, 20, // U twists
        24, 15, 42, 51}; // D twists

    /**
     * Count misoriented edges considering the FB axis.
     *
     * @param representation
     * @return the number of misoriented edges in a cube.
     * @throws RepresentationException
     */
    public static int countMisorientedEdges(String representation) throws RepresentationException {
        assert representation.length() == 54 : "Expected size: 54 = 6x9 stickers. Use cubeState.toFaceCube().";

        int result = 0;
        for (int i = 0; i < edges; i++) {
            if (!isOrientedEdge(representation, i)) {
                result++;
            }
        }
        return result;
    }

    public static int countMisorientedEdges(CubePuzzle.CubeState cubeState) throws RepresentationException {
        String representation = cubeState.toFaceCube();
        return countMisorientedEdges(representation);
    }

    public static boolean isOrientedEdge(String representation, int index) throws RepresentationException {
        char color;
        char attachedColor;

        char uColor = representation.charAt(central + 0 * stickersPerFace);
        char rColor = representation.charAt(central + 1 * stickersPerFace);
        // char fColor = representation.charAt(central + 2 * stickersPerFace);
        char dColor = representation.charAt(central + 3 * stickersPerFace);
        char lColor = representation.charAt(central + 4 * stickersPerFace);
        // char bColor = representation.charAt(central + 5 * stickersPerFace);

        color = representation.charAt(edgesIndex[index]);
        attachedColor = representation.charAt(attachedEdgesIndex[index]);

        if (color == uColor || color == dColor) {
            return true;
        }
        if (color == rColor || color == lColor) {
            return false;
        }
        // Now, we're left with f and b colors.
        if (attachedColor == uColor || attachedColor == dColor) {
            return false;
        } else if (attachedColor == rColor || attachedColor == lColor) {
            return true;
        }

        throw new RepresentationException();
    }

    /**
     * Given a representation, returns a number that represents the orientation of a
     * corner at index cornerIndex
     *
     * @param representation a representation of a cube.
     * @param cornerIndex    0 &le; cornerIndex &lt; 8
     * @return 0 if the corner is oriented. 1 if the corner is oriented clockwise.
     * 2 if the corner is oriented counter clockwise.
     * @throws RepresentationException
     */
    public static int getCornerOrientationNumber(String representation, int cornerIndex)
        throws RepresentationException {
        char uColor = representation.charAt(central + 0 * stickersPerFace);
        char dColor = representation.charAt(central + 3 * stickersPerFace);

        int index = cornersIndex[cornerIndex];
        int indexClockWise = cornersIndexClockWise[cornerIndex];
        int indexCounterClockWise = cornersIndexCounterClockWise[cornerIndex];

        char sticker = representation.charAt(index);
        char stickerClockWise = representation.charAt(indexClockWise);
        char stickerCounterClockWise = representation.charAt(indexCounterClockWise);

        if (sticker == uColor || sticker == dColor) {
            return 0;
        } else if (stickerClockWise == uColor || stickerClockWise == dColor) {
            return 1;
        } else if (stickerCounterClockWise == uColor || stickerCounterClockWise == dColor) {
            return 2;
        }
        throw new RepresentationException();
    }

    /**
     * Sum of corner orientation. 0 for oriented, 1 for clockwise, 2 for counter
     * clock wise.
     *
     * @param representation
     * @return The sum of it.
     * @throws RepresentationException
     */
    public static int cornerOrientationSum(String representation) throws RepresentationException {
        assert representation.length() == 54 : "Expected size: 54 = 6x9 stickers. Use cubeState.toFaceCube().";

        int result = 0;

        for (int i = 0; i < corners; i++) {
            result += getCornerOrientationNumber(representation, i);
        }

        return result;
    }

    // Parity is the oddness of the number of two-swaps.
    // Right now, we don't consider cases where corner and edge parity are uneven.
    public static boolean hasParity(String faceletRepresentation) {
        Search search = new SearchWCA();
        int errors = search.verify(faceletRepresentation);

        if (errors != 0) {
            throw new RuntimeException("min2phase cannot handle the cube: Error " + errors);
        }

        int edgeParity = search.cc.getEdgeParityBit();
        int cornerParity = search.cc.getCornerParityBit();

        return edgeParity == 1 || cornerParity == 1;
    }

    // Actually, these next 2 methods did not need to be public, but it's for
    // consistency with the
    // getFinalLocationOfEdheSticker method.
    public int[] getEdgesIndex() {
        return edgesIndex;
    }

    public int[] getAttachedEdgesIndex() {
        return attachedEdgesIndex;
    }

    /**
     * Given a representation of a cube and the initial position of an edge (when
     * solved), returns the final index position of that edge. The UB sticker is the
     * first one on a toFaceCube representation, so call this 0 (index). Consider a
     * U applied to a solved cube and let's call this repr. UB goes to UR, which is
     * the 3rd edge in a representation (solved).
     * getFinalLocationOfEdgeSticker(repr, 0) returns 2, which is 3rd sticker (0
     * based).
     * <p>
     * UF is initially the 4th edge, so index 3. When an F is applied it goes to RF,
     * which is the 6th edge on the toFaceCube representation, so this returns 5.
     *
     * @param representation: the final representation of a cube.
     * @param i:              the index, when solved, of a edge (0 for UB or BU, 1
     *                        for UL or LU, 3 for UR...
     * @return If the final position of a sticker is in UB (either U or B), it
     * returns 0 (which is the index of UB in edgesIndex or
     * attachedEdgesIndex). If the final position of a sticker is in UL
     * (either U or L), it returns 1 (which is the index of UL in
     * edgesIndex). etc.
     * @throws RepresentationException
     */
    public static int getFinalPositionOfEdge(String representation, int i) throws RepresentationException {
        // Here, we are reusing the position of edges mentioned above.

        if (representation.length() != 54) {
            throw new IllegalArgumentException("Representation size must be 54.");
        }
        if (i < 0 || i >= edges) {
            throw new IllegalArgumentException("Make sure 0 <= i <= 11.");
        }

        int initialEdgeIndex = edgesIndex[i];
        int initialAttachedIndex = attachedEdgesIndex[i];

        char initialColor = representation.charAt(central + initialEdgeIndex / stickersPerFace * stickersPerFace);
        char initialAttachedColor = representation
            .charAt(central + initialAttachedIndex / stickersPerFace * stickersPerFace);

        for (int j = 0; j < edges; j++) {
            char color = representation.charAt(edgesIndex[j]);
            char attachedColor = representation.charAt(attachedEdgesIndex[j]);

            if (color == initialColor && attachedColor == initialAttachedColor) {
                return j;
            }
            if (color == initialAttachedColor && attachedColor == initialColor) {
                return j;
            }
        }

        throw new RepresentationException();
    }

    public static int getFinalPositionOfCorner(String representation, int i) throws RepresentationException {
        // Here, we are reusing the position of edges mentioned above.

        if (representation.length() != 54) {
            throw new IllegalArgumentException("Representation size must be 54.");
        }
        if (i < 0 || i >= corners) {
            throw new IllegalArgumentException("Make sure 0 <= i <= 7.");
        }

        int initialIndex = cornersIndex[i];
        int initialClockWiseIndex = cornersIndexClockWise[i];
        int initialCounterClockWiseIndex = cornersIndexCounterClockWise[i];

        char initialColor = representation.charAt(initialIndex - initialIndex % stickersPerFace + central);
        char initialClockWiseColor = representation
            .charAt(initialClockWiseIndex - initialClockWiseIndex % stickersPerFace + central);
        char initialCounterClockWiseColor = representation
            .charAt(initialCounterClockWiseIndex - initialCounterClockWiseIndex % stickersPerFace + central);
        String initial = "" + initialColor + initialClockWiseColor + initialCounterClockWiseColor;

        for (int j = 0; j < corners; j++) {
            char color = representation.charAt(cornersIndex[j]);
            char clockWiseColor = representation.charAt(cornersIndexClockWise[j]);
            char counterClockWiseColor = representation.charAt(cornersIndexCounterClockWise[j]);

            String current = "" + color + clockWiseColor + counterClockWiseColor;

            if (stringCompareIgnoringOrder(initial, current)) {
                return j;
            }
        }

        throw new RepresentationException();
    }
}
