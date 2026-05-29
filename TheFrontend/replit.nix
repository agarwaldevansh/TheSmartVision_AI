{ pkgs }: {
  deps = [
    # OpenCV system drivers (required for cv2 to work on Replit)
    pkgs.libglvnd
    pkgs.libGL
    pkgs.glib

    # Common utilities
    pkgs.zlib
    pkgs.xorg.libX11
    pkgs.glibcLocales

    # NOTE: pkgs.tesseract has been removed.
    # We now use EasyOCR (Python package) which needs no system binaries.
  ];
}
