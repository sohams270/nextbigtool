"use client";

import { useState } from "react";
import Btn from "./Btn";
import PostStoryModal from "./PostStoryModal";

export default function PostStoryWallButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Btn variant="primary" size="sm" onClick={() => setOpen(true)}>
        Post Your Story →
      </Btn>
      {open && <PostStoryModal onClose={() => setOpen(false)} />}
    </>
  );
}
