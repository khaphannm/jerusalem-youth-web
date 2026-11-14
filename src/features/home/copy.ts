import type { HomePage } from "@/lib/cms/domain";

// Fallback landing-page copy, used until the Home Page entry is published in
// the CMS or when the CMS cannot be reached. English is a later phase.
export const defaultHomePage: HomePage = {
  heroHeadline: "Cùng lớn lên trong đức tin.",
  heroDescription:
    "Một nơi để người trẻ kết nối, cùng học Lời Chúa và khích lệ nhau bước đi với Chúa mỗi ngày. Cùng Jerusalem Youth khám phá đời sống đức tin qua những buổi gặp gỡ và những điều giản dị trong cuộc sống.",
  callToAction: {
    label: "Nhắn tin qua Facebook",
    url: "https://www.facebook.com/jerusalemyouth20",
  },
  introduction: {
    eyebrow: "Chúng mình là ai?",
    title: "Đức tin được vun đắp trong sự đồng hành.",
    description:
      "Jerusalem Youth mong muốn trở thành một cộng đồng nơi người trẻ cùng tìm hiểu Lời Chúa, chia sẻ những câu chuyện trong cuộc sống và khích lệ nhau trưởng thành trong đức tin.",
  },
  community: {
    eyebrow: "Đời sống cộng đồng",
    title: "Cùng nhau sống đức tin.",
    description: null,
  },
  communityThemes: [
    {
      title: "Thờ phượng và cầu nguyện",
      description:
        "Dành thời gian hướng về Chúa, bày tỏ lòng biết ơn và cùng cầu nguyện.",
    },
    {
      title: "Học Lời Chúa",
      description:
        "Cùng suy ngẫm Kinh Thánh và tìm cách áp dụng vào những lựa chọn mỗi ngày.",
    },
    {
      title: "Kết nối và đồng hành",
      description:
        "Lắng nghe, sẻ chia và khích lệ nhau trong hành trình trưởng thành.",
    },
  ],
  gathering: {
    eyebrow: "Hẹn gặp bạn",
    title: "Buổi gặp gỡ sắp tới",
    description:
      "Xem chủ đề, thời gian và địa điểm để chuẩn bị cho buổi gặp gỡ cùng Jerusalem Youth.",
  },
  gatheringEmptyMessage:
    "Thời gian cho buổi gặp gỡ tiếp theo sẽ được cập nhật tại đây. Bạn có thể nhắn tin qua Facebook để hỏi thêm thông tin.",
  stories: {
    eyebrow: "Câu chuyện cộng đồng",
    title: "Mỗi hành trình đều có một câu chuyện.",
    description:
      "Lắng nghe những chia sẻ về đức tin và cuộc sống từ các bạn trong cộng đồng Jerusalem Youth.",
  },
  teaching: {
    eyebrow: "Nuôi dưỡng đức tin mỗi ngày",
    title: "Tiếp tục hành trình sau mỗi buổi gặp gỡ.",
    description:
      "Dành một khoảng lặng để suy ngẫm, lắng nghe và học thêm qua những bài chia sẻ và tài liệu được giới thiệu tại đây.",
  },
  newcomer: {
    eyebrow: "Lần đầu tìm hiểu Jerusalem Youth?",
    title: "Bắt đầu từ một lời chào.",
    description:
      "Nếu bạn đang tìm hiểu về Jerusalem Youth, hãy nhắn tin cho chúng mình. Bạn có thể hỏi về buổi gặp gỡ sắp tới, địa điểm hoặc cách kết nối với cộng đồng.",
  },
  newcomerSteps: [
    {
      title: "Xem thông tin buổi gặp gỡ",
      description:
        "Kiểm tra thời gian, địa điểm và những lưu ý được ghi trong trang sự kiện.",
    },
    {
      title: "Hỏi điều bạn muốn biết",
      description:
        "Nhắn tin qua trang Facebook chính thức khi bạn cần thêm thông tin trước khi tham gia.",
    },
  ],
  invitation: {
    eyebrow: "Một lời mời dành cho bạn",
    title: "Cùng bắt đầu hành trình với Jerusalem Youth.",
    description:
      "Bạn muốn tìm hiểu thêm hoặc kết nối với chúng mình? Hãy gửi một lời chào qua trang Facebook chính thức của Jerusalem Youth.",
  },
};
