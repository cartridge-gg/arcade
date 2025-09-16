import { Button, Input } from "@cartridge/ui";
import { CommentRow, CommentRowProps } from "../prediction/comment-row";
import { useCallback, useState } from "react";
import { useUsername } from "@/hooks/account";
import { useAddress } from "@/hooks/address";

const MOCKDATA = [
  {
    name: "tedison",
    comment: "clicksave's got it in the bag",
    timestamp: "2s ago",
  },
  {
    name: "glihm",
    comment: "clicksave's got it in the bag",
    timestamp: "2s ago",
  },
  {
    name: "kariy",
    comment: "clicksave's got it in the bag",
    timestamp: "2s ago",
  },
  {
    name: "ashe",
    comment: "clicksave's got it in the bag",
    timestamp: "2s ago",
  },
  {
    name: "flipper",
    comment: "clicksave's got it in the bag",
    timestamp: "2s ago",
  },
] satisfies Array<CommentRowProps>;

export const PredictionCommentsScene = () => {
  const [comments, setComments] = useState<Array<CommentRowProps>>(MOCKDATA);
  const { address } = useAddress();
  const { username } = useUsername({ address });

  const handleAddComment = useCallback(
    (newComment: CommentRowProps) => {
      setComments([newComment, ...comments]);
    },
    [comments],
  );

  return (
    <div className="w-full h-full self-stretch flex flex-col gap-3 rounded overflow-clip">
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (!e.currentTarget[0]) return;

          const body = {
            name: username || "Anonymous",
            comment: (e.currentTarget[0] as HTMLInputElement).value,
            timestamp: "Just now",
          } satisfies CommentRowProps;
          return handleAddComment(body);
        }}
        className="flex flex-row gap-4 w-full"
      >
        <div className="w-full">
          <Input
            className="bg-spacer-100 hover:bg-spacer-100 focus-visible:bg-spacer-100 w-full"
            type="text"
            placeholder="Enter message"
          />
        </div>
        <Button variant="primary" className="h-10 w-[88px] px-3 py-2.5 rounded">
          <span className="text-spacer-100 text-sm font-medium">Post</span>
        </Button>
      </form>

      {comments.map((comment, index) => (
        <CommentRow key={index} {...comment} />
      ))}
    </div>
  );
};
