import { ImageResponse } from "next/og";

// The home-screen icon when the site is saved to a phone: the DN logo on the
// site's sage background.
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 22H44A28 28 0 0 1 44 78H22" stroke="#2d703c"/>
  <path d="M22 78V22L60 70V36" stroke="#203128"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E7E9DF",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml,${encodeURIComponent(logo)}`}
          width={124}
          height={124}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
