/** กรอบกระจกกรมมาตรฐานทั้งแอป — ขอบขาวบาง โทนน้ำเงิน ไม่ทอง/ม่วง */
export const MAE_GLASS = {
  bg: "linear-gradient(145deg, rgba(12, 28, 52, 0.78) 0%, rgba(6, 16, 34, 0.7) 100%)",
  bgSoft:
    "linear-gradient(145deg, rgba(12, 28, 52, 0.7) 0%, rgba(6, 16, 34, 0.62) 100%)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.14)",
  shadow: "0 16px 36px rgba(0, 0, 0, 0.28)",
  blur: "blur(18px) saturate(1.15)",
} as const;

export const maeGlassStyle = {
  background: MAE_GLASS.bg,
  border: MAE_GLASS.border,
  boxShadow: `${MAE_GLASS.shadow}, ${MAE_GLASS.highlight}`,
  backdropFilter: MAE_GLASS.blur,
  WebkitBackdropFilter: MAE_GLASS.blur,
} as const;
