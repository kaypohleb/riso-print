"use client";
import { RGBtoCMYBSplit } from "@/helpers/colour";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";

const CMYB_COLOURS = ["cyan", "magenta", "yellow", "black"];

export default function Home() {
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const cyanCanvasRef = useRef<HTMLCanvasElement>(null);
  const magentaCanvasRef = useRef<HTMLCanvasElement>(null);
  const yellowCanvasRef = useRef<HTMLCanvasElement>(null);
  const blackCanvasRef = useRef<HTMLCanvasElement>(null);
  const [colours, setColours] = useState<boolean[]>(
    Array(CMYB_COLOURS.length).fill(true),
  );
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [cyanImage, setCyanImage] = useState<string>("");
  const [magentaImage, setMagentaImage] = useState<string>("");
  const [yellowImage, setYellowImage] = useState<string>("");
  const [blackImage, setBlackImage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (hiddenCanvasRef.current) {
        hiddenCanvasRef.current.height = img.naturalHeight;
        hiddenCanvasRef.current.width = img.naturalWidth;
        const ctx = hiddenCanvasRef.current.getContext(
          "2d",
        ) as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      }
      setImageHeight(img.naturalHeight);
      setImageWidth(img.naturalWidth);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const drawSplitCanvas = useCallback(() => {
    if (
      !hiddenCanvasRef.current ||
      !cyanCanvasRef.current ||
      !magentaCanvasRef.current ||
      !yellowCanvasRef.current ||
      !blackCanvasRef.current
    )
      return;
    const ctx = hiddenCanvasRef.current.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    const cyanCtx = cyanCanvasRef.current.getContext(
      "2d",
    ) as CanvasRenderingContext2D;
    const magentaCtx = magentaCanvasRef.current.getContext(
      "2d",
    ) as CanvasRenderingContext2D;
    const yellowCtx = yellowCanvasRef.current.getContext(
      "2d",
    ) as CanvasRenderingContext2D;
    const blackCtx = blackCanvasRef.current.getContext(
      "2d",
    ) as CanvasRenderingContext2D;

    cyanCanvasRef.current.width = imageWidth;
    cyanCanvasRef.current.height = imageHeight;
    magentaCanvasRef.current.width = imageWidth;
    magentaCanvasRef.current.height = imageHeight;
    yellowCanvasRef.current.width = imageWidth;
    yellowCanvasRef.current.height = imageHeight;
    blackCanvasRef.current.width = imageWidth;
    blackCanvasRef.current.height = imageHeight;

    const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);
    const data = imageData.data;
    const cyanImageData = cyanCtx.createImageData(imageWidth, imageHeight).data;
    const magentaImageData = magentaCtx.createImageData(
      imageWidth,
      imageHeight,
    ).data;
    const yellowImageData = yellowCtx.createImageData(
      imageWidth,
      imageHeight,
    ).data;
    const blackImageData = blackCtx.createImageData(
      imageWidth,
      imageHeight,
    ).data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        cyanImageData[i] = 0;
        cyanImageData[i + 1] = 0;
        cyanImageData[i + 2] = 0;
        cyanImageData[i + 3] = 0;
        magentaImageData[i] = 0;
        magentaImageData[i + 1] = 0;
        magentaImageData[i + 2] = 0;
        magentaImageData[i + 3] = 0;
        yellowImageData[i] = 0;
        yellowImageData[i + 1] = 0;
        yellowImageData[i + 2] = 0;
        yellowImageData[i + 3] = 0;
        continue;
      }

      const cmyb = RGBtoCMYBSplit(data[i], data[i + 1], data[i + 2]);
      const [cyan, magenta, yellow, black] = cmyb.map((v) =>
        Math.max(0, Math.min(1, v)),
      );

      for (let j = 0; j < 4; j++) {
        const r = 255 * (j == 0 ? 1 - cyan : 1) * (j == 3 ? 1 - black : 1);
        const g = 255 * (j == 1 ? 1 - magenta : 1) * (j == 3 ? 1 - black : 1);
        const b = 255 * (j == 2 ? 1 - yellow : 1) * (j == 3 ? 1 - black : 1);

        if (j == 0) {
          cyanImageData[i] = Math.round(r);
          cyanImageData[i + 1] = Math.round(g);
          cyanImageData[i + 2] = Math.round(b);
          cyanImageData[i + 3] = data[i + 3];
        }
        if (j == 1) {
          magentaImageData[i] = Math.round(r);
          magentaImageData[i + 1] = Math.round(g);
          magentaImageData[i + 2] = Math.round(b);
          magentaImageData[i + 3] = data[i + 3];
        }
        if (j == 2) {
          yellowImageData[i] = Math.round(r);
          yellowImageData[i + 1] = Math.round(g);
          yellowImageData[i + 2] = Math.round(b);
          yellowImageData[i + 3] = data[i + 3];
        }
        if (j == 3) {
          blackImageData[i] = Math.round(r);
          blackImageData[i + 1] = Math.round(g);
          blackImageData[i + 2] = Math.round(b);
          blackImageData[i + 3] = data[i + 3];
        }
      }
    }
    cyanCtx.putImageData(
      new ImageData(cyanImageData, imageWidth, imageHeight),
      0,
      0,
    );
    magentaCtx.putImageData(
      new ImageData(magentaImageData, imageWidth, imageHeight),
      0,
      0,
    );
    yellowCtx.putImageData(
      new ImageData(yellowImageData, imageWidth, imageHeight),
      0,
      0,
    );
    blackCtx.putImageData(
      new ImageData(blackImageData, imageWidth, imageHeight),
      0,
      0,
    );
    // PNG format preserves transparency; JPEG would flatten to opaque
    setCyanImage(cyanCanvasRef.current.toDataURL("image/png"));
    setMagentaImage(magentaCanvasRef.current.toDataURL("image/png"));
    setYellowImage(yellowCanvasRef.current.toDataURL("image/png"));
    setBlackImage(blackCanvasRef.current.toDataURL("image/png"));
  }, [imageWidth, imageHeight]);

  useEffect(() => {
    if (imageHeight > 0 && imageWidth > 0) {
      drawSplitCanvas();
    }
  }, [imageHeight, imageWidth, colours, drawSplitCanvas]);

  const toggleColour = (index: number) => {
    setColours((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const backgroundImage = useMemo(() => {
    const images = [];
    if (colours[0]) images.push(`url(${cyanImage})`);
    if (colours[1]) images.push(`url(${magentaImage})`);
    if (colours[2]) images.push(`url(${yellowImage})`);
    if (colours[3]) images.push(`url(${blackImage})`);
    return images.join(", ");
  }, [cyanImage, magentaImage, yellowImage, blackImage, colours]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 p-4">
      <h1 className="text-2xl font-bold">Risoprint</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      <div className="flex gap-4 flex-wrap justify-center">
        {CMYB_COLOURS.map((name, i) => (
          <label key={name} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={colours[i]}
              onChange={() => toggleColour(i)}
            />
            <span className="capitalize">{name}</span>
          </label>
        ))}
      </div>
      <div
        className="relative"
        style={{
          width: imageWidth || undefined,
          height: imageHeight || undefined,
          background: backgroundImage ? backgroundImage : undefined,
          backgroundBlendMode: "multiply",
        }}
      ></div>
      <canvas ref={cyanCanvasRef} className="border border-gray-300 hidden" />
      <canvas
        ref={magentaCanvasRef}
        className="border border-gray-300 hidden"
      />
      <canvas ref={yellowCanvasRef} className="border border-gray-300 hidden" />
      <canvas ref={blackCanvasRef} className="border border-gray-300 hidden" />

      <canvas ref={hiddenCanvasRef} className="hidden" />
    </div>
  );
}
